module.exports = {
    isPc: function(self){
        let ua = self.ctx.headers["user-agent"].toLowerCase();;
        var agentID = ua.match(/(iphone|ipod|ipad|android)/);
        //手机端pad
        if(agentID){
            return false;
        }else{  
            return true;
        }
    }
}