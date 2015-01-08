// (c) Dean McNamee <dean@gmail.com>, 2014.

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
  var s = 1;

  if (num === 0) denom = 1;

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

  this.n = num * s;
  this.d = denom;

  this.toNumber = function() { return this.n / this.d; };
  this.toString = function() {
    return this.d === 1 ? this.n+'' : this.n + '/' + this.d;
  };

  this.toUnicode = function() {
    if (this.n === 1) {
      if (this.d === 2) return "\u00bd";
      if (this.d === 4) return "\u00bc";
    }
    return this.toString();
  };

  this.divScalar = function(v) {
    return new Rational(this.n, this.d * v);
  };

  this.mulScalar = function(v) {
    return new Rational(this.n * v, this.d);
  };

  this.divScalar = function(v) {
    return new Rational(this.n, this.d * v);
  };

  this.mul = function(r) {
    return new Rational(this.n * r.n, this.d * r.d);
  };

  this.div = function(r) {
    return new Rational(this.n * r.d, this.d * r.n);
  };

  this.add$ = function(r) {
    var c = this.add(r);
    this.n = c.n; this.d = c.d;
    return this;
  };

  this.add = function(r) {
    return this.d === r.d ?
        new Rational(this.n + r.n, this.d) :
        new Rational(this.n * r.d + r.n * this.d, this.d * r.d);
  };

  this.sub = function(r) {
    return new Rational(this.n * r.d - r.n * this.d, this.d * r.d);
  };

  this.neg = function() {
    return new Rational(-this.n, this.d);
  };

  this.recip = function() {
    return new Rational(this.d, this.n);
  };

  this.isOne = function() {
    return this.n === 1 && this.d === 1;
  };

  this.isOneOrNegOne = function() {
    return (this.n === 1 || this.n === -1) && this.d === 1;
  };

  this.isZero = function() {
    return this.n === 0;
  };

  this.isNeg = function() {
    return (this.n < 0) ^ (this.d < 0);
  };

  this.dup = function() {
    return new Rational(this.n, this.d);
  };
}

Rational.createFromInteger = function(n) {
  if (n !== (n|0)) { console.trace('xx'); throw 'xx'; }
  return new Rational(n, 1);
}

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

  this.integrate = function() {
    var res = new Polynomial(degree + 1);
    res[0] = new Rational(0, 1);
    for (var i = 0, il = coef.length; i < il; ++i) {
      var r = coef[i];
      res.c[i+1] = r.divScalar(i+1);
    }
    return res;
  }

  this.diff = function() {
    if (degree === 0)
      return new Polynomial(0, [new Rational(0, 1)]);

    var res = new Polynomial(degree - 1);
    for (var i = 1, il = coef.length; i < il; ++i) {
      var r = coef[i];
      res.c[i-1] = r.mulScalar(i);
    }
    return res;
  }

  this.add = function(p) {
    var d = this.degree > p.degree ? this.degree : p.degree;
    var n = new Polynomial(d);
    for (var i = 0; i <= d; ++i) {
      if (i > this.degree) {
        n.c[i] = p.c[i];
      } else if (i > p.degree) {
        n.c[i] = coef[i];
      } else {
        n.c[i] = p.c[i].add(coef[i]);
      }
    }
    return n;
  };

  this.mul = function(p) {  // super O(n^2).
    var a = this.c;
    var b = p.c;

    var c = new Array(this.degree + p.degree + 1);
    for (var i = 0, il = c.length; i < il; ++i)
      c[i] = new Rational(0, 1);

    for (var i = 0, il = a.length; i < il; ++i) {
      for (var j = 0, jl = b.length; j < jl; ++j) {
        c[i+j] = c[i+j].add(a[i].mul(b[j]));
      }
    }

    while (c.length !== 1 && c[c.length - 1].isZero()) c.pop();

    return new Polynomial(c.length - 1, c);
  };

  this.dup = function() {
    var c = new Array(coef.length);
    for (var i = 0, il = c.length; i < il; ++i) {
      c[i] = coef[i].dup();
    }
    return new Polynomial(c.length - 1, c);
  }

  this.scaleScalar$ = function(s) {
    for (var i = 0, il = coef.length; i < il; ++i) {
      coef[i] = coef[i].mulScalar(s);
    }
    return this;
  };

  this.scaleScalar = function(s) {
    var p = this.dup();
    p.scaleScalar$(s);
    return p;
  };

  this.scale$ = function(r) {
    for (var i = 0, il = coef.length; i < il; ++i) {
      coef[i] = coef[i].mul(r);
    }
    return this;
  };

  this.scale = function(r) {
    var p = this.dup();
    p.scale$(r);
    return p;
  };

  this.subst = function(p) {  // composition better name?
    var c = new Polynomial(0, [coef[0]]);
    var pp = p;
    for (var i = 1, il = coef.length; i < il; ++i) {
      if (i !== 1) pp = pp.mul(p);  // Computationally brutal.
      c = c.add(pp.scale(coef[i]));
    }

    return c;
  };

  this.pretty = function(sym) {
    sym = sym === undefined ? 't' : sym;
    var str = '';
    for (var i = 0, il = coef.length; i < il; ++i) {
      if (i === 0) {
        str += coef[i];
      } else if (i === 1) {
        str += ' + ' + coef[i] + '*' + sym;
      } else {
        str += ' + ' + coef[i] + '*' + sym + '^' + i;
      }
    }
    return str;
  }

  this.toJS = function(sym) {
    sym = sym === undefined ? 't' : sym;
    var str = '';
    var ssym = sym;
    var parts = [ ];
    for (var i = 0, il = coef.length; i < il; ++i) {
      if (i === 0) {
        if (!coef[0].isZero())
          parts.push(coef[0]);
        continue;
      }

      if (coef[i].isZero()) {
      } else if (coef[i].isOne()) {
        parts.push(ssym);
      } else {
        parts.push(coef[i] + '*' + ssym);
      }
      ssym += '*' + sym;
    }
    if (parts.length === 0) parts = ['0'];
    return parts.join(' + ');
  }

  this.toUnicode = function(sym) {
    sym = sym === undefined ? 't' : sym;
    var str = '';
    var parts = [ ];
    for (var i = 0, il = coef.length; i < il; ++i) {
      if (coef[i].isZero())  // zero term
        continue;

      var up = '';
      switch (i) {
        case 0:
          parts.push(coef[0].toUnicode());
          continue;
        case 1: break;
        //case 1: up = "\u00b9"; break;
        /*
        case 2: up = "\u00b2"; break;
        case 3: up = "\u00b3"; break;
        case 4: up = "\u2074"; break;
        case 5: up = "\u2075"; break;
        case 6: up = "\u2076"; break;
        case 7: up = "\u2077"; break;
        case 8: up = "\u2078"; break;
        case 9: up = "\u2079"; break;
        */
        default:
          var up = '^' + i;
          break;
      }

      if (coef[i].isOne()) {
        parts.push(sym + up);
      } else {
        parts.push(coef[i].toUnicode() + '*' + sym + up);
      }
    }
    return parts.join(' + ').replace(/ \+ \-/g, ' - ').replace(/ 1\*/g, ' ');
  }

  this.eval = function(t) {
    var res = coef[0].toNumber();
    var tt = t;
    for (var i = 1, il = coef.length; i < il; ++i) {
      res += tt * coef[i].toNumber();
      tt *= t;
    }
    return res;
  };

  this.evalRational = function(t) {
    var res = coef[0];
    var tt = t;
    for (var i = 1, il = coef.length; i < il; ++i) {
      res = res.add(tt.mul(coef[i]));
      tt = tt.mul(t);
    }
    return res;
  };
}

Polynomial.createFromRational = function(r) {
  return new Polynomial(0, [r]);
};

Polynomial.createFromInteger = function(v) {
  return new Polynomial(0, [Rational.createFromInteger(v)]);
};

function isRational(r) {
  return r instanceof Rational;
}

exports.gcd = gcd;
exports.bino = bino;
exports.Rational = Rational;
exports.isRational = isRational;
exports.Polynomial = Polynomial;
