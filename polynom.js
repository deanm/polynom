// (c) Dean McNamee <dean@gmail.com>, 2014.

// Some abbreviations used, often as function name suffixes:
//   Q - Rationals (set ℚ), object of class Rational
//   Z - Integers (set ℤ), JavaScript number
//   R - Reals (set ℝ), JavaScript number
//   P - Polynomial, object of class Polynomial
//   $ - Operation is mutable, happens in place without creating a new object.

function binary_gcd(u, v) {
  if (u === v) return u;
  if (u === 0) return v;
  if (v === 0) return u;

  var shift = 0;
  for (; ((u|v) & 1) == 0; ++shift) {
    u >>= 1; v >>= 1;
  }
  while ((u & 1) == 0) u >>= 1;

  do {
    while ((v & 1) == 0) v >>= 1;
    if (u > v) { var t = v; v = u; u = t; }
    v = v - u;
  } while (v !== 0);

  return u << shift;
}

function euclid_gcd(u, v) {
  var t;
  while (v !== 0) {
    t = v; v = u % v; u = t;
  }
  return u;
}

function gcd(u, v) {
  if ((u|0) !== u || (v|0) !== v)  // Bigger than 32-bit?
    return euclid_gcd(u, v);
  return binary_gcd(u, v);
}

function bino(n, k) {
  var t = 1;
  if (k < n - k) {
    for (var i = n; i >= n - k + 1; --i)
      t *= i/(n-i+1);
  } else {
    for (var i = n; i >= k + 1; --i)
      t *= i/(n-i+1);
  }

  return t;
}

function Rational(num, denom) {
  if (denom === 0) throw "Invalid Rational, zero denominator.";

  if (num === 0) denom = 1;  // Normalize all zeros to the same 0/1.

  var s = 1;

  if (num < 0) {
    s = -s;
    num = -num;
  }

  if (denom < 0) {
    s = -s;
    denom = -denom;
  }

  // try to simplify...
  // Maybe this should be optional?
  if (num !== 0) {
    var g = gcd(num, denom);
    if (g !== 1) {
      num /= g; denom /= g;
    }
  }

  // TODO: Better to switch to p/q mathematical convention?
  this.n = num * s;
  this.d = denom;
}

/* static */
Rational.createFromZ = function(n) {
  if (n !== (n|0)) { console.trace('xx'); throw 'xx'; }
  return new Rational(n, 1);
};

Rational.prototype.isOne = function() {
  return this.n === 1 && this.d === 1;
};

Rational.prototype.isOneOrNegOne = function() {
  return (this.n === 1 || this.n === -1) && this.d === 1;
};

Rational.prototype.isZero = function() {
  return this.n === 0;
};

Rational.prototype.isNeg = function() {
  return !!((this.n < 0) ^ (this.d < 0));
};

Rational.prototype.divZ = function(v) {
  return new Rational(this.n, this.d * v);
};

Rational.prototype.mulZ = function(v) {
  return new Rational(this.n * v, this.d);
};

Rational.prototype.divQ = function(r) {
  return new Rational(this.n * r.d, this.d * r.n);
};

Rational.prototype.mulQ = function(r) {
  return new Rational(this.n * r.n, this.d * r.d);
};

Rational.prototype.addQ = function(r) {
  return this.d === r.d ?
      new Rational(this.n + r.n, this.d) :
      new Rational(this.n * r.d + r.n * this.d, this.d * r.d);
};

Rational.prototype.addQ$ = function(r) {
  var c = this.addQ(r);
  this.n = c.n; this.d = c.d;
  return this;
};

Rational.prototype.subQ = function(r) {
  return new Rational(this.n * r.d - r.n * this.d, this.d * r.d);
};

Rational.prototype.neg = function() {
  return new Rational(-this.n, this.d);
};

Rational.prototype.recip = function() {
  return new Rational(this.d, this.n);
};

Rational.prototype.dup = function() {
  return new Rational(this.n, this.d);
};

Rational.prototype.toR = function() {
  return this.n / this.d;
};

Rational.prototype.toString = function() {
  return this.n + (this.d === 1 ? '' : '/' + this.d);
};

Rational.prototype.toUnicode = function() {
  if (this.n === 1) {
    if (this.d === 2) return "\u00bd";
    if (this.d === 4) return "\u00bc";
  }
  return this.toString();
};


function Polynomial(degree, coef) {
  this.degree = degree;

  if (coef === undefined) {
    coef = new Array(degree + 1);
    for (var i = 0, il = coef.length; i < il; ++i)
      coef[i] = new Rational(0, 1);
  } else {
    for (var i = 0, il = coef.length; i < il; ++i) {
      if (typeof(coef[i]) === 'number')
        coef[i] = Rational.createFromNumber(coef[i]);
    }
  }

  if (coef.length !== degree + 1)
    throw 'Coefficients array incorrect length for degree.';

  this.c = coef;
}

Polynomial.createFromQ = function(r) {
  return new Polynomial(0, [r]);
};

Polynomial.createFromZ = function(v) {
  return new Polynomial(0, [Rational.createFromZ(v)]);
};

Polynomial.prototype.mulZ$ = function(s) {
  var c = this.c;
  for (var i = 0, il = c.length; i < il; ++i) {
    c[i] = c[i].mulZ(s);
  }
  return this;
};

Polynomial.prototype.mulZ = function(s) {
  var p = this.dup();
  p.mulZ$(s);
  return p;
};

Polynomial.prototype.mulQ$ = function(r) {
  var c = this.c;
  for (var i = 0, il = c.length; i < il; ++i) {
    c[i] = c[i].mulQ(r);
  }
  return this;
};

Polynomial.prototype.mulQ = function(r) {
  var p = this.dup();
  p.mulQ$(r);
  return p;
};

Polynomial.prototype.addP = function(p) {
  var d = this.degree > p.degree ? this.degree : p.degree;
  var n = new Polynomial(d);
  var c = this.c;
  for (var i = 0; i <= d; ++i) {
    if (i > this.degree) {
      n.c[i] = p.c[i];
    } else if (i > p.degree) {
      n.c[i] = c[i];
    } else {
      n.c[i] = p.c[i].addQ(c[i]);
    }
  }
  return n;
};

Polynomial.prototype.mulP = function(p) {  // super O(n^2).
  var a = this.c;
  var b = p.c;

  var c = new Array(this.degree + p.degree + 1);
  for (var i = 0, il = c.length; i < il; ++i)
    c[i] = new Rational(0, 1);

  for (var i = 0, il = a.length; i < il; ++i) {
    for (var j = 0, jl = b.length; j < jl; ++j) {
      c[i+j] = c[i+j].addQ(a[i].mulQ(b[j]));
    }
  }

  while (c.length !== 1 && c[c.length - 1].isZero()) c.pop();

  return new Polynomial(c.length - 1, c);
};

Polynomial.prototype.integrate = function() {
  var res = new Polynomial(this.degree + 1);
  res[0] = new Rational(0, 1);
  var c = this.c;
  for (var i = 0, il = c.length; i < il; ++i) {
    var r = c[i];
    res.c[i+1] = r.divZ(i+1);
  }
  return res;
};

Polynomial.prototype.diff = function() {
  if (this.degree === 0)
    return new Polynomial(0, [new Rational(0, 1)]);

  var res = new Polynomial(this.degree - 1);
  var c = this.c;
  for (var i = 1, il = c.length; i < il; ++i) {
    var r = c[i];
    res.c[i-1] = r.mulZ(i);
  }
  return res;
};

Polynomial.prototype.dup = function() {
  var c = new Array(this.c.length);
  for (var i = 0, il = c.length; i < il; ++i) {
    c[i] = this.c[i].dup();
  }
  return new Polynomial(c.length - 1, c);
};

Polynomial.prototype.substP = function(p) {  // composition better name?
  var c = new Polynomial(0, [this.c[0]]);
  var pp = p;
  for (var i = 1, il = this.c.length; i < il; ++i) {
    if (i !== 1) pp = pp.mulP(p);  // Computationally brutal.
    c = c.addP(pp.mulQ(this.c[i]));
  }

  return c;
};

Polynomial.prototype.pretty = function(sym) {
  sym = sym === undefined ? 't' : sym;
  var str = '';
  var c = this.c;
  for (var i = 0, il = c.length; i < il; ++i) {
    if (i === 0) {
      str += c[i];
    } else if (i === 1) {
      str += ' + ' + c[i] + '*' + sym;
    } else {
      str += ' + ' + c[i] + '*' + sym + '^' + i;
    }
  }
  return str;
};

////////

Polynomial.prototype.toJS = function(sym) {
  sym = sym === undefined ? 't' : sym;
  var str = '';
  var ssym = sym;
  var parts = [ ];
  var c = this.c;
  for (var i = 0, il = c.length; i < il; ++i) {
    if (i === 0) {
      if (!c[0].isZero())
        parts.push(c[0]);
      continue;
    }

    if (c[i].isZero()) {
    } else if (c[i].isOne()) {
      parts.push(ssym);
    } else {
      parts.push(c[i] + '*' + ssym);
    }
    ssym += '*' + sym;
  }
  if (parts.length === 0) parts = ['0'];
  return parts.join(' + ');
};

Polynomial.prototype.evalR = function(t) {
  var c = this.c;
  var res = c[0].toR();
  var tt = t;
  for (var i = 1, il = c.length; i < il; ++i) {
    res += tt * c[i].toR();
    tt *= t;
  }
  return res;
};

Polynomial.prototype.evalQ = function(t) {
  var c = this.c;
  var res = c[0];
  var tt = t;
  for (var i = 1, il = c.length; i < il; ++i) {
    res = res.addQ(tt.mulQ(c[i]));
    tt = tt.mulQ(t);
  }
  return res;
};

function isRational(r) {
  return r instanceof Rational;
}

exports.gcd = gcd;
exports.bino = bino;
exports.Rational = Rational;
exports.isRational = isRational;
exports.Polynomial = Polynomial;
