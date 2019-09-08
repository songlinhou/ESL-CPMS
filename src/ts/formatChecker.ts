export function isInputValid(username:string){
    username = username.trim();
    if(username.length == 0){
        return false;
    }
    if((<any>username).includes(" ")){
        return false;
    }
    return true;
}
