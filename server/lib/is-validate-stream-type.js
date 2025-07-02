
function isValidateStreamType(type) {
    if(!type || type=='bestvideo[]') return false;

    return type=='bestaudio' || /^bestvideo(\[.*\])?$/.test(type);
}

export default isValidateStreamType;