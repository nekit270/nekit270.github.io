Object.prototype._set = function(obj){
    for(let i in obj){
        let e = obj[i];
        this[i] = e;
    }
    return this;
}
Object.defineProperty(Object.prototype, '_set', {enumerable: false});
