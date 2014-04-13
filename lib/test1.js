/**
 * Created by alo on 3/21/14.
 */
var a = {};

a.peso = 45;

console.log(a.peso);

a.altura = 1.5;

console.log(a.altura);

a.bmi = function () {
    return this.peso * this.altura;
}

console.log(a.bmi());

a["bmi2"] = function () {
    return this.peso * this.altura * 2;
};

console.log(a.bmi2());

var multiplicox2 = function (entrada) {
    return entrada * 2;
};

console.log(multiplicox2(a.bmi()));

var result = {};
result.matches = [];
result.details = {'total': 0, 'skipTo': 0, 'returnLimit': 0};
result.filters = {};
result.filters.langCode = [];
result.filters.semTag = {};

result.filters.semTag["uno y uno"] = "UNO";
console.log(result.filters.semTag["uno y uno"]);
console.log(result.filters.semTag.length);
result.filters.semTag["dos"] = "DOS";
console.log(result.filters.semTag["dos"]);
console.log("tres : "+ result.filters.semTag["tres"]);
console.log("has dos : "+result.filters.semTag.hasOwnProperty("dos"));
console.log("has tres : "+result.filters.semTag.hasOwnProperty("tres"));

console.log(result.filters.semTag.length);
console.log("keys");
for(var key in result.filters.semTag) {
    console.log(key);
    console.log(result.filters.semTag[key]);
}