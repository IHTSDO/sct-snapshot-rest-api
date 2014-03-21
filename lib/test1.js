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