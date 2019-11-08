export function constructFullname(first:string,middle:string,last:string){
    if(middle){
        return `${first} ${middle} ${last}`;
    }
    return `${first} ${last}`
}