// (c) Dean McNamee <dean@gmail.com>, 2014.

// Tests to be run via node.

var pn = require('./polynom.js');

function assert_eq(a, b) {
  if (a !== b) {
    var m = 'assert_eq: ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b);
    console.trace(m); throw m;
  }
}

/*
var p = new Polynomial(3, [1, 4, 3, 5]);
var p1 = p.integrate();
var p2 = p1.diff();
//console.log(p.pretty('t'));
console.log(p1.pretty('t'));
console.log(p2.pretty('t'));
//console.log(p1.add(p2).pretty('t'));
//console.log(p1.toJS('t'));

var p3 = new Polynomial(2, [0, 1, 1]);
var p4 = new Polynomial(2, [1, 1, 1]);
//console.log(p3.mul(p4).pretty('t'));
//console.log(p1.mul(p2).pretty('t'));
console.log(p3.toJS());
console.log(p4.toJS());
console.log(p3.subst(p4).toJS());
*/


function test_rational() {
  var r0 = new pn.Rational(194481, 130321);
  assert_eq("388962/130321", r0.add(r0).toString());
}

function test_polynomial() {
  var p6 = new pn.Polynomial(3, [new pn.Rational(-9261, 6859),
                                 new pn.Rational(26459, 6859),
                                 new pn.Rational(-25200, 6859),
                                 new pn.Rational(-8000, 6859)]);
  var p7 = new pn.Polynomial(1, [new pn.Rational(-21, 19),
                                 new pn.Rational(20, 19)]);

  assert_eq("194481/130321 + -740859/130321*t + 1058380/130321*t^2 + -336000/130321*t^3 + -160000/130321*t^4", p6.mul(p7).pretty());
}

test_rational();
test_polynomial();
