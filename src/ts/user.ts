interface loginSession {
    username:string,
    email:string,
    gender:string,
    identity:number, // 0: student, 1: partner, 2 - 9: administrators
}

interface studentInfo {
    country:string,
    digest:string,
    major:string,
    role:string,
    stufirstname:string,
    stuid:string,
    stulastname:string,
    stumidname:string,
    timestamp:number
}

interface partnerInfo {
    country:string,
    digest:string,
    major:string,
    role:string,
    cpfirstname:string,
    cpid:string,
    cplastname:string,
    cpmidname:string,
    timestamp:number
}

interface adminInfo {
    digest:string,
    role:string,
    adminfirstname:string,
    adminid:string,
    adminlastname:string,
    adminmidname:string,
    timestamp:number,
    privilege:number
}