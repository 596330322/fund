// 如果跨天了，需要重新设置
const date = new Date().toLocaleDateString();
const storage = {
    setItem(key,value){
        sessionStorage.setItem(key+date,JSON.stringify(value))
    },
    getItem(key){
        return JSON.parse(sessionStorage.getItem(key+date))
    }
}
export default  storage