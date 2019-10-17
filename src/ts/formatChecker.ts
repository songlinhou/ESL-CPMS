export function isUsernameValid(username:string){
    username = username.trim();
    if(username.length == 0){
        return false;
    }
    if((<any>username).includes(" ")){
        return false;
    }
    return true;
}

export function isStringValid(input:string){
    if(!input)
    {
        return false;
    }
    input = input.trim();
    if(!input){
        return false;
    }
    return true;
}