var str = "January,February,March,April,May,June,July,August,September,October,November,December";
var str1 = "1,2,7,4,5,6";

// Comma separated string to array
var array = str.split(',');

// Comma separated string to array With all values to give a datatype string
var array = str.split(',').map(String).sort();

// Comma separated string to array With all values to give a datatype number
var array1 = str1.split(',').map(Number);

// Comma separated string to array With all values to give a datatype number
var array2 = str1.split(',').map(Number).sort();

// Comma separated string to array With all values to give a datatype number
var array2 = str1.split(',').map(Number).reverse();

let string = array.join(',').toString();

console.log(string);