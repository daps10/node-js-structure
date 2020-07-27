

// array methods
const items = [
    {name: 'bike', price: 100},
    {name: 'TV', price: 500},
    {name: 'Fridge', price: 600},
    {name: 'Laptop', price: 400},
    {name: 'Car', price: 700},
    {name: 'Phone', price: 900},
]

// filtered item use for the filtering array should be pass by given filtering
const filteredItems = items.filter((items) => {
    return items.name == 'bike';
});

// Map method for array :: super easy for getting single key's all values
const mapItems = items.map((items) => {
    return items.price;
});

// found array for finding single object from an array
const foundItems = items.find((item) => {
    return item.name === 'bike';
});

// for each method to get all values
items.forEach((item) => {
    // console.log(item.name)
});

// This method is use for the check filter for some items in that array returns true or false;
const hasInexpesiveItems = items.some((item) => {
    return item.price <= 600;
});

// This method is use for the check filter for all items into array returns true or false;
const hasInexpesiveItemsAll = items.every((item) => {
    return item.price <= 10000;
});

// Total of all items price using reduce method
const total = items.reduce((currentTotal, item) => {
    return item.price + currentTotal
}, 0)

const includeval = [1,2,3,4,5,6];
const includevaltwo = includeval.includes(1);

// result should be bellow
// console.log(includevaltwo)

var matches = '128,126,125,124,123,122,118,117,116,115,99,98,97',
    numbers = '126,110';
    // has = numbers.split(',').every(Set.prototype.has, new Set(matches.split(',')));
    match = numbers.split(",").every(n => matches.includes(n));
console.log(match);
