export function insertValue (class_name, value) {
    const els = document.getElementsByClassName(class_name);
    
    for (let i = 0; i < els.length; i ++) {
        els[i].innerHTML = value;
    }
    
}