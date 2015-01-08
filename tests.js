// (c) Dean McNamee <dean@gmail.com>, 2014.

// Tests to be run via node.

var pn = require('./polynom.js');

function assert_eq(a, b) {
  if (a !== b) {
    var m = 'assert_eq: ' + JSON.stringify(a) + ' !== ' + JSON.stringify(b);
    console.trace(m); throw m;
  }
}

function assert_throws(estr, cb) {
  try {
    cb();
  } catch(e) {
    assert_eq(estr, e.toString());
    return;
  }
  throw 'Expected an exception.';
}

function Q(p, q) { return new pn.Rational(p, q); }

function test_rational() {

  assert_throws("Invalid Rational, zero denominator.", function() {
    new pn.Rational(0, 0);
  });
  assert_throws("Invalid Rational, zero denominator.", function() {
    new pn.Rational(1, 0);
  });

  assert_eq(true,  Q(1, 1).isOne());
  assert_eq(true,  Q(1, 1).isOneOrNegOne());
  assert_eq(false, Q(1, 1).isZero());
  assert_eq(false, Q(1, 1).isNeg());

  assert_eq(false, Q(0, 1).isOne());
  assert_eq(false, Q(0, 1).isOneOrNegOne());
  assert_eq(true,  Q(0, 1).isZero());
  assert_eq(false, Q(1, 1).isNeg());

  assert_eq(false, Q(-1, 1).isOne());
  assert_eq(true,  Q(-1, 1).isOneOrNegOne());
  assert_eq(false, Q(-1, 1).isZero());
  assert_eq(true,  Q(-1, 1).isNeg());

  var r0 = Q(194481, 130321);
  r0 = r0.addQ(r0);
  assert_eq("388962/130321", r0.toString());
  r0 = r0.divZ(2);
  assert_eq("194481/130321", r0.toString());
  r0 = r0.divQ(Q(1, 2));
  assert_eq("388962/130321", r0.toString());
  r0 = r0.mulQ(Q(1, 2));
  assert_eq("194481/130321", r0.toString());
  r0 = r0.mulZ(2);
  assert_eq("388962/130321", r0.toString());
  r0 = r0.addQ(Q(13, 57));
  assert_eq("1256053/390963", r0.toString());
  r0 = r0.subQ(Q(13, 57));
  assert_eq("388962/130321", r0.toString());
  r0 = r0.recip();
  assert_eq("130321/388962", r0.toString());
  r0 = r0.neg();
  assert_eq("-130321/388962", r0.toString());
  r0 = r0.neg();
  assert_eq("130321/388962", r0.toString());
}

function test_polynomial() {

  assert_throws("Polynomial must be at least degree 0.", function() {
    new pn.Polynomial([]);
  });

  assert_eq("4", pn.Polynomial.createFromZ(4).pretty());
  assert_eq("3/4", pn.Polynomial.createFromQ(Q(3, 4)).pretty());

  var p0 = new pn.Polynomial([Q(1, 2), Q(2, 3)]);
  assert_eq("1/2 + 2/3*t", p0.pretty());
  p0 = p0.mulZ(2);
  assert_eq("1 + 4/3*t", p0.pretty());
  p0 = p0.mulQ(Q(1, 2));
  assert_eq("1/2 + 2/3*t", p0.pretty());

  var p1 = new pn.Polynomial([Q(1, 3), Q(1, 2), Q(5, 1)]);
  assert_eq(p0.addP(p1).pretty(), p1.addP(p0).pretty());
  var p2 = p1.addP(p0);
  assert_eq("5/6 + 7/6*t + 5*t^2", p2.pretty());

  assert_eq(p0.mulP(p2).pretty(), p2.mulP(p0).pretty());
  var p3 = p0.mulP(p2);
  assert_eq("5/12 + 41/36*t + 59/18*t^2 + 10/3*t^3", p3.pretty());

  var p4 = p3.integrate();
  assert_eq("0 + 5/12*t + 41/72*t^2 + 59/54*t^3 + 5/6*t^4", p4.pretty());

  var p5 = p4.diff();
  assert_eq("5/12 + 41/36*t + 59/18*t^2 + 10/3*t^3", p5.pretty());

  var p6 = new pn.Polynomial([Q(-9261, 6859),
                              Q(26459, 6859),
                              Q(-25200, 6859),
                              Q(-8000, 6859)]);
  var p7 = new pn.Polynomial([Q(-21, 19),
                              Q(20, 19)]);

  assert_eq("194481/130321 + -740859/130321*t + 1058380/130321*t^2 + -336000/130321*t^3 + -160000/130321*t^4", p6.mulP(p7).pretty());

  var p8 = new pn.Polynomial([Q(2, 1), Q(2, 1), Q(1, 2)]);
  var p9 = new pn.Polynomial([Q(1, 1), Q(1, 1)]);
  var p10 = p8.substP(p9);
  assert_eq("9/2 + 3*t + 1/2*t^2", p10.pretty());

  assert_eq("9/2 + 3*t + 1/2*t*t", p10.toJS());

  assert_eq(18, p10.evalR(3));
  assert_eq("162/25", p10.evalQ(Q(3, 5)).toString());
}

test_rational();
test_polynomial();
