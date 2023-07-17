/**
 * 一天可以运行两三次,有些视频可能重复看没有积分,运行一段时间后视频可能会重复变多,加大maxvodid变量值
 * 每天不要过多运行,以免可看的视频越来越少
 * 环境变量 xjsp0627 = 手机号#密码&手机号#密码
 * 时间建议10,22点,可以开宝箱
 * 注册链接 https://GWGVT4.xjxj.tv?inviteCode=GWGVT4
 */
const $ = new Env("香蕉视频");
const notify  =$.isNode() ? require('./sendNotify') : '';
var envSplitor = ['&', '\n']
var ckName = 'xjsp0627'
var userCookie = ($.isNode() ? process.env[ckName] : $.getdata(ckName)) || '';
var debug=true;
var actionWaitime=1;
var msg="" ,userList=[];
let baseurl="https://q5fksnth0aks.ciscomfg.in"
let maxvodid=56555;//视频id最大值
let maxvideo=10,maxfab=5,maxcomment=1,maxad=1
class UserInfo {
    constructor(str,iphone) {
        this.ckerror=false
        this.httpResult=null;
        this.accno=str,this.iphone=iphone;
        this.userInfo={},this.realParam=null;
        this.xxx_api_auth="";
        if(this.accno.indexOf("#")>-1){
            let map=this.accno.split("#");
            this.accno=map[0],this.passward=map[1];
        }else
            this.xxx_api_auth=this.accno
        this.logprefix=`[${this.iphone}]`;
    }
    getHeader() {
        let dyhead= {};
        dyhead["cookie"]="xxx_api_auth="+this.xxx_api_auth;
        return dyhead;
    }
    getPublicUrl() {
        let url="pid=&apiVersion=30&deviceModel=Redmi%20K20%20Pro&brand=Xiaomi&deviceName=raphael&serial=unknown&platform=android&version=4.1.4&_t="+new Date().getTime();
        return url;
    }
    async getUserInfo() {
        let result,fail=true;
        this.ckerror=0;
        if(this.disable) {this.ckerror=true; return}
        if(this.accno!=""){
            if(this.xxx_api_auth=="")await this.login();
            await this.balance();
        }
        if(this.ckerror){
            this.ckerror=1;
            msg+=`账号[${this.index}] ck可能失效;`;
        }
    }
    async login() {
        await this.httpRequest('post', popu(baseurl+"/login?mobi="+this.accno+"&password="+this.passward+"&logintype=0&aup=1","",null))
        let result = this.httpResult;
        if(result.retcode==0&&result.data){
            this.xxx_api_auth=result.data.xxx_api_auth;
        }else{
            this.ckerror=true;
            logAndNotify(`    登陆失败:${result?result['errmsg']:""}`)
        }
    }
    async balance() {
        if(this.ckerror)return;
        await this.httpRequest('get', popu(baseurl+"/ucp/index?"+this.getPublicUrl(),"",null,this.getHeader()))
        let result = this.httpResult;
        if(result.retcode==0&&result.data){
            this.userInfo=result.data.user;
            logAndNotify(`${this.logprefix} 查询余额:${this.userInfo.goldcoin}`);
        }else{
            this.ckerror=true;
            logAndNotify(`    ck可能失效:${result?result['errmsg']:""}`)
        }
    }
    async signtask() {
        await $.wait(actionWaitime*2*1000)
        await this.httpRequest('post', popu(baseurl+"/ucp/task/sign?"+this.getPublicUrl(),"",null,this.getHeader()))
        logAndNotify(`${this.logprefix}签到:${this.httpResult.retcode==0?"成功,奖励:"+this.httpResult.data.taskdone:this.httpResult.errmsg}`)
    }
    async awardtask() {
        await this.main_openbox();
        await this.main_submitdailyTask();
        await this.balance();
    }

    async main_submitdailyTask(tasklist){
        await $.wait(actionWaitime*2*1000)
        await this.httpRequest('get', popu(baseurl+"/ucp/task/qrcodeSave?"+this.getPublicUrl(),"",null,this.getHeader()))
        logAndNotify(`${this.logprefix}保存二维码图片:${this.httpResult.retcode==0?"成功,奖励:"+this.httpResult.data.taskdone:this.httpResult.errmsg}`)
        let video=0,fab=0,comment=0,ad=0
        for(let index=0;index<200;index++){
            if(video<maxvideo){
                await $.wait(actionWaitime*1000)
                let vodid=getRandomInt(100,maxvodid);
                await this.httpRequest('get', popu(baseurl+"/vod/reqplay/"+vodid+"?"+this.getPublicUrl(),"",null,this.getHeader()))
                if(this.httpResult.retcode==0){
                    video++
                    await $.wait(actionWaitime*1000)
                    logAndNotify(`${this.logprefix}看视频${video}个成功`)
                    if(fab<maxfab){
                        await this.httpRequest('post', popu(baseurl+"/favorite/add?"+this.getPublicUrl()+"&vodid="+vodid,"",null,this.getHeader()))
                        if(this.httpResult.retcode==0){
                            fab++;
                            logAndNotify(`${this.logprefix}收藏视频${fab}个成功`)
                        }
                    }
                    if(ad<maxad){
                        await $.wait(actionWaitime*1000)
                        await this.httpRequest('get', popu(baseurl+"/ucp/task/adviewClick?"+this.getPublicUrl(),"",null,this.getHeader()))
                        if(this.httpResult.retcode==0||this.httpResult.errmsg.indexOf("已经送过")>-1){
                            ad++;
                            logAndNotify(`${this.logprefix}看广告${ad}个成功`)
                        }
                    }
                    if(comment<maxcomment){
                        await $.wait(actionWaitime*1000)
                        await this.httpRequest('post', popu(baseurl+"/comment/post?"+this.getPublicUrl()+"&vodid="+vodid+"&parentid=0&content="+encodeURIComponent("太棒了吧"),"",null,this.getHeader()))
                        if(this.httpResult.retcode==0){
                            comment++;
                            logAndNotify(`${this.logprefix}发表评论${comment}个成功`)
                        }
                    }
                }
            }
        }
    }
    async main_openbox(){
        await $.wait(actionWaitime*2*1000)
        await this.httpRequest('get', popu(baseurl+"/ucp/taskbox/taskboxopen?taskid=1022&"+this.getPublicUrl(),"",null,this.getHeader()))
        logAndNotify(`${this.logprefix}每日神秘宝箱:${this.httpResult.retcode==0?"成功,奖励:"+this.httpResult.data.taskdone:this.httpResult.errmsg}`)
    }

    async start() {
        try {
            console.log("\n    ☆"+this.iphone+' 开始执行任务');
            await this.getUserInfo()
            if (!this.ckerror) {
                await this.signtask()
                await this.awardtask()
            }
        } catch (e) { console.log(e)
        } finally {
            return Promise.resolve(1);
        }
    }
    async   httpRequest(method, url,log) {
        if(log)console.log(url)
        let obj=this;
        return new Promise((resolve) => {
            $.send(method, url, async (err, req, resp) => {
                try {
                    if (err) return console.log(url.url+":"+err)
                    if (resp.body) {
                        if (typeof resp.body == "object") {
                            obj.httpResult = resp.body;
                        } else {
                            try {  obj.httpResult = JSON.parse(resp.body);
                            } catch (e) {obj.httpResult = resp.body;}
                        }
                    }
                } catch (e) {  console.log(e);
                } finally { resolve(); }
            });
        });
    }
}
!(async () => {
    if (typeof $request !== "undefined") {
        await GetRewrite()
    } else {
        var list=checkEnv();
        if (list.length==0) return;
        for (var i=0;i<list.length;i++) {
            var iphone="账号"+(i+1);
            console.log('\n==========='+iphone+' 开始批量任务 ===========');
            await (new UserInfo(list[i], iphone)).start();
        }
        if(msg!="")await notify.sendNotify($.name,msg)
    }
})()
    .catch((e) => console.log(e))
    .finally(() => $.done())
function checkEnv() {
    var userCount=0,list=[];
    if (userCookie) {
        var splitor = envSplitor[0];
        for (var sp of envSplitor) {
            if (userCookie.indexOf(sp) > -1) {
                splitor = sp;
                break;
            }
        }
        for (var userCookies of userCookie.split(splitor)) {
            if (userCookies){
                list.push(userCookies);
            }
        }
        userCount = list.length
    }
    console.log(`找到[${ckName}] 变量 ${userCount}组账号`)
    return list;
}

function getTime(t,time) {
    var tt=time?time:new Date();
    let e = {
        "M+": tt.getMonth() + 1,
        "d+": tt.getDate(),
        "h+": tt.getHours(),
        "m+": tt.getMinutes(),
        "s+": tt.getSeconds(),
        "q+": Math.floor(((new Date).getMonth() + 3) / 3),
        S: (new Date).getMilliseconds()
    };

    /(y+)/.test(t) && (t = t.replace(RegExp.$1, (tt.getFullYear() + "").substr(4 - RegExp.$1.length)));
    for (let s in e)
        new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
    return t
}
function logAndNotify(str,showtime=false) {
    console.log((showtime? getTime("hh:mm:ss")+" ":"")+str);
}
function getRandomInt(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

function popu(url, body = '',cookie,headerlist={}) {
    var host = url.replace('//', '/').split('/')[1]
    body= (typeof body== "object"?JSON.stringify(body):body);
    var urlObject = {
        url: url,
        headers:  {
            "Host": host,
            "accept": "*/*","charset":"utf-8",
            "User-Agent":"got (https://github.com/sindresorhus/got)"
        },
        timeout: 5000,
    }
    if (body) {
        urlObject.body = body
        urlObject.headers['content-length'] = body.length
    }
    if(headerlist){
        for(var i in headerlist){
            urlObject.headers[i]=   headerlist[i];
        }
    }
    return urlObject;
}

///////////////////////////////////////////////////////////////////
function Env(a, b) {
    return "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0), new class {
        constructor(a, b) {
            this.name = a, this.notifyStr = "", this.startTime = (new Date).getTime(), Object.assign(this, b), console.log(`${this.name} 开始运行：
`)
        } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } getdata(b) { var a = this.getval(b); if (/^@/.test(b)) { var [, c, f] = /^@(.*?)\.(.*?)$/.exec(b), d = c ? this.getval(c) : ""; if (d) try { var e = JSON.parse(d); a = e ? this.lodash_get(e, f, "") : a } catch (g) { a = "" } } return a } setdata(c, d) { var a = !1; if (/^@/.test(d)) { var [, b, e] = /^@(.*?)\.(.*?)$/.exec(d), f = this.getval(b), i = b ? "null" === f ? null : f || "{}" : "{}"; try { var g = JSON.parse(i); this.lodash_set(g, e, c), a = this.setval(JSON.stringify(g), b) } catch (j) { var h = {}; this.lodash_set(h, e, c), a = this.setval(JSON.stringify(h), b) } } else a = this.setval(c, d); return a } getval(a) { return this.isSurge() || this.isLoon() ? $persistentStore.read(a) : this.isQuanX() ? $prefs.valueForKey(a) : this.isNode() ? (this.data = this.loaddata(), this.data[a]) : this.data && this.data[a] || null } setval(b, a) { return this.isSurge() || this.isLoon() ? $persistentStore.write(b, a) : this.isQuanX() ? $prefs.setValueForKey(b, a) : this.isNode() ? (this.data = this.loaddata(), this.data[a] = b, this.writedata(), !0) : this.data && this.data[a] || null } send(b, a, f = () => { }) { if ("get" != b && "post" != b && "put" != b && "delete" != b) { console.log(`无效的http方法：${b}`); return } if ("get" == b && a.headers ? (delete a.headers["Content-Type"], delete a.headers["Content-Length"]) : a.body && a.headers && (a.headers["Content-Type"] || (a.headers["Content-Type"] = "application/x-www-form-urlencoded")), this.isSurge() || this.isLoon()) { this.isSurge() && this.isNeedRewrite && (a.headers = a.headers || {}, Object.assign(a.headers, { "X-Surge-Skip-Scripting": !1 })); var c = { method: b, url: a.url, headers: a.headers, timeout: a.timeout, data: a.body }; "get" == b && delete c.data, $axios(c).then(a => { var { status: b, request: c, headers: d, data: e } = a; f(null, c, { statusCode: b, headers: d, body: e }) }).catch(a => console.log(a)) } else if (this.isQuanX()) a.method = b.toUpperCase(), this.isNeedRewrite && (a.opts = a.opts || {}, Object.assign(a.opts, { hints: !1 })), $task.fetch(a).then(a => { var { statusCode: b, request: c, headers: d, body: e } = a; f(null, c, { statusCode: b, headers: d, body: e }) }, a => f(a)); else if (this.isNode()) { this.got = this.got ? this.got : require("got"); var { url: d, ...e } = a; this.instance = this.got.extend({ followRedirect: !1 }), this.instance[b](d, e).then(a => { var { statusCode: b, request: c, headers: d, body: e } = a; f(null, c, { statusCode: b, headers: d, body: e }) }, b => { var { message: c, response: a } = b; f(c, a, a && a.body) }) } } time(a) { var b = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "h+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; for (var c in /(y+)/.test(a) && (a = a.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))), b) new RegExp("(" + c + ")").test(a) && (a = a.replace(RegExp.$1, 1 == RegExp.$1.length ? b[c] : ("00" + b[c]).substr(("" + b[c]).length))); return a } async showmsg() { if (!this.notifyStr) return; var a = this.name + " \u8FD0\u884C\u901A\u77E5\n\n" + this.notifyStr; if ($.isNode()) { var b = require("./sendNotify"); console.log("\n============== \u63A8\u9001 =============="), await b.sendNotify(this.name, a) } else this.msg(a) } logAndNotify(a) { console.log(a), this.notifyStr += a, this.notifyStr += "\n" } msg(d = t, a = "", b = "", e) { var f = a => { if (!a) return a; if ("string" == typeof a) return this.isLoon() ? a : this.isQuanX() ? { "open-url": a } : this.isSurge() ? { url: a } : void 0; if ("object" == typeof a) { if (this.isLoon()) { var b = a.openUrl || a.url || a["open-url"], c = a.mediaUrl || a["media-url"]; return { openUrl: b, mediaUrl: c } } if (this.isQuanX()) { var d = a["open-url"] || a.url || a.openUrl, e = a["media-url"] || a.mediaUrl; return { "open-url": d, "media-url": e } } if (this.isSurge()) return { url: a.url || a.openUrl || a["open-url"] } } }; this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(d, a, b, f(e)) : this.isQuanX() && $notify(d, a, b, f(e))); var c = ["", "============== \u7CFB\u7EDF\u901A\u77E5 =============="]; c.push(d), a && c.push(a), b && c.push(b), console.log(c.join("\n")) } getMin(a, b) { return a < b ? a : b } getMax(a, b) { return a < b ? b : a } padStr(e, b, f = "0") { var a = String(e), g = b > a.length ? b - a.length : 0, c = ""; for (var d = 0; d < g; d++)c += f; return c + a } json2str(b, e, f = !1) { var c = []; for (var d of Object.keys(b).sort()) { var a = b[d]; a && f && (a = encodeURIComponent(a)), c.push(d + "=" + a) } return c.join(e) } str2json(e, f = !1) { var d = {}; for (var a of e.split("#")) { if (!a) continue; var b = a.indexOf("="); if (-1 == b) continue; var g = a.substr(0, b), c = a.substr(b + 1); f && (c = decodeURIComponent(c)), d[g] = c } return d } randomString(d, a = "abcdef0123456789") { var b = ""; for (var c = 0; c < d; c++)b += a.charAt(Math.floor(Math.random() * a.length)); return b } randomList(a) { var b = Math.floor(Math.random() * a.length); return a[b] } wait(a) { return new Promise(b => setTimeout(b, a)) } done(a = {}) {
            var b = (new Date).getTime(), c = (b - this.startTime) / 1e3; console.log(`
${this.name} 运行结束，共运行了 ${c} 秒！`), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(a)
        }
    }(a, b)
}
