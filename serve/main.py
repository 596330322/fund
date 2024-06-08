from flask import Flask,request,jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources=r'/*')

# 基金数据API接口URL
URL = {
    "DAY": "https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_kline_us&query=FUND&code=FUND&market_type=us&newFormat=1&name=FUND&is_kc=0&ktype=day&finClientType=pc&finClientType=pc",
    "MONTH": "https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_kline_us&query=FUND&code=FUND&market_type=us&newFormat=1&name=FUND&is_kc=0&ktype=month&finClientType=pc&finClientType=pc",
    "WEEK": "https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_kline_us&query=FUND&code=FUND&market_type=us&newFormat=1&name=FUND&is_kc=0&ktype=week&finClientType=pc&finClientType=pc",
    "YEAR": "https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_kline_us&query=FUND&code=FUND&market_type=us&newFormat=1&name=FUND&is_kc=0&ktype=year&finClientType=pc",
    "QUARTER": "https://finance.pae.baidu.com/vapi/v1/getquotation?srcid=5353&pointType=string&group=quotation_kline_us&query=FUND&code=FUND&market_type=us&newFormat=1&name=FUND&is_kc=0&ktype=quarter&finClientType=pc",
    "STATUS":"https://finance.pae.baidu.com/vapi/v1/getquotation?all=1&srcid=5353&pointType=string&group=quotation_minute_us&market_type=us&new_Format=1&name=FUND&finClientType=pc&query=FUND&code=FUND"
}
# 格式化数据
def convert_data(original_string):
    # 首先使用逗号分割字符串成一个列表
    string_list = original_string.split(';')
    # 初始化二维数组
    two_dim_array = []
    for item in string_list:
        item = item.split(',')
        two_dim_array.append({
            'k': item[1],
            'o': "%.3f" % float(item[2]),
            'c': "%.3f" % float(item[3]),
            'h': "%.3f" % float(item[5]),
            'l': "%.3f" % float(item[6]),
            't':item[7] if item[7] == '--' else f"{float(item[7])/10000:.2f}万",
            'v': item[4] if item[4] == '--' else f"{float(item[4])/10000:.2f}",
            'r': item[10],
            'cp': item[8],
            'cpr': item[9]+'%',
            'ma5': item[12],
            'ma10': item[14],
            'ma20': item[16],
        })
    return two_dim_array
# 格式化数据
def convert_active_data(original_string):
    # 首先使用逗号分割字符串成一个列表
    string_list = original_string.split(';')
    # 初始化二维数组
    two_dim_array = []
    for item in string_list:
        item = item.split(',')
        two_dim_array.append({
            'k': f'{item[1]}',
            'p': item[2],
            'avg': item[3],#均价
            'cp': item[4],#涨跌额
            'cpr': item[5],#涨跌幅
            'v': item[6],#成交量
            't': item[7],#成交额
        })
    return two_dim_array
# 获取日月年数据
def get_fund_data(types = 'DAY'):
    response = requests.get('https://gushitong.baidu.com/stock/us-FUND?name=FUND')
    cookie = response.cookies.get_dict()
    headers = {
        "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Cookie":f"BIDUPSID=344B75C1A54209EE24BF5F3AD2902E0A; PSTM=1693390242; {cookie}; MCITY=-340%3A; BDUSS=3ZQTzBMWDNYUGRWSm9wY001YzUxNnpRZVJsZWNDfk5xeDlJLTZubmpMUEdsbmRtSUFBQUFBJCQAAAAAAAAAAAEAAADouoKbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMYJUGbGCVBmQ; BDUSS_BFESS=3ZQTzBMWDNYUGRWSm9wY001YzUxNnpRZVJsZWNDfk5xeDlJLTZubmpMUEdsbmRtSUFBQUFBJCQAAAAAAAAAAAEAAADouoKbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMYJUGbGCVBmQ; H_PS_PSSID=60271_60299_60307; H_WISE_SIDS=60271_60299_60307; BAIDUID_BFESS=E968E2B388BCAED4E65B980C5BAA7C21:FG=1; PSINO=7; delPer=0; BA_HECTOR=21ak0lagal210h0h2k8l25a1ajp5u81j65uh71v; ZFY=6qwurXyXtvIDwpILTr8OWtZ1kP4Ic5TgSnEme4EwY:B0:C; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; H_WISE_SIDS_BFESS=60271_60299_60307; ab_sr=1.0.1_MGNjZGI0ZDNkNTgxZGRjMzgzZmE3MjA0Y2ExMjg4NGE5ZjBkZGU3YTQ0MDNhYWI3YmI3Njc2OWJiYmIyZDI2MTM3YjJmNWMxNzViYTU3NzkxMjgwMmFiMWQ3YTI4NDgwNDViZjMwMTkzMzY3MzVmZDI3NzJjZDhkOTYyNzE1NmQ5ZDE0NWRjMDNkNmVlZmExOTYxODM1OWIyMjAxY2Q0Nw=="
    }
    response = requests.get(URL[types],headers=headers)
    if response.status_code == 200:
        return response.json()['Result']['newMarketData']['marketData']
    else:
        return None
# 获取看板数据的函数
def get_board_data():
    response = requests.get('https://gushitong.baidu.com/stock/us-FUND?name=FUND')
    cookie = response.cookies.get_dict()
    headers = {
        "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Cookie":f"BIDUPSID=344B75C1A54209EE24BF5F3AD2902E0A; PSTM=1693390242; {cookie}; MCITY=-340%3A; BDUSS=3ZQTzBMWDNYUGRWSm9wY001YzUxNnpRZVJsZWNDfk5xeDlJLTZubmpMUEdsbmRtSUFBQUFBJCQAAAAAAAAAAAEAAADouoKbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMYJUGbGCVBmQ; BDUSS_BFESS=3ZQTzBMWDNYUGRWSm9wY001YzUxNnpRZVJsZWNDfk5xeDlJLTZubmpMUEdsbmRtSUFBQUFBJCQAAAAAAAAAAAEAAADouoKbAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMYJUGbGCVBmQ; H_PS_PSSID=60271_60299_60307; H_WISE_SIDS=60271_60299_60307; BAIDUID_BFESS=E968E2B388BCAED4E65B980C5BAA7C21:FG=1; PSINO=7; delPer=0; BA_HECTOR=21ak0lagal210h0h2k8l25a1ajp5u81j65uh71v; ZFY=6qwurXyXtvIDwpILTr8OWtZ1kP4Ic5TgSnEme4EwY:B0:C; BDORZ=B490B5EBF6F3CD402E515D22BCDA1598; H_WISE_SIDS_BFESS=60271_60299_60307; ab_sr=1.0.1_MGNjZGI0ZDNkNTgxZGRjMzgzZmE3MjA0Y2ExMjg4NGE5ZjBkZGU3YTQ0MDNhYWI3YmI3Njc2OWJiYmIyZDI2MTM3YjJmNWMxNzViYTU3NzkxMjgwMmFiMWQ3YTI4NDgwNDViZjMwMTkzMzY3MzVmZDI3NzJjZDhkOTYyNzE1NmQ5ZDE0NWRjMDNkNmVlZmExOTYxODM1OWIyMjAxY2Q0Nw=="
    }
    response = requests.get(URL['STATUS'],headers=headers)

    if response.status_code == 200:
        data = response.json()
        return {'update':data['Result']['update'],"pankouinfos":data['Result']['pankouinfos']['list'],'cur':data['Result']['cur'],"marketData":data['Result']['newMarketData']['marketData'],"detailinfos":data['Result']['detailinfos'][::-1]}
    else:
        return None

# Flask路由，处理GET请求并返回基金数据
@app.route('/funds', methods=['GET'])
def funds():
    types = request.args['type']
    fund_data = get_fund_data(types)
    if fund_data is not None:
        v = convert_data(fund_data)
        return jsonify({"data":{"list":v},"code":0,"msg":"success"})
    else:
        return jsonify({'error': 'Failed to retrieve fund data'}), 400
@app.route('/board', methods=['GET'])
def board():
    data = get_board_data()
    if data is not None:
        v = convert_active_data(data['marketData'][0]['p'])
        return jsonify({"data":{**data,'marketData':v},"code":0,"msg":"success"})
    else:
        return jsonify({'error': 'Failed to retrieve fund data'}), 400
if __name__ == '__main__':
    app.run(debug=True)


