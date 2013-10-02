
var Person = (function(){

var fontname = "Ubuntu",
	fontsize = 12,
	marginx = 20,
	marginy = 20,
	padding = 5,
	radius = 10;
var width, height;

var index = {};

var Person = function(sex,name,dob){
	if(["M","F"].indexOf(sex)===-1) throw "invalid-sex";
	this.name = name;
	this.dob = dob;
	this.sex = sex;
	this.children = [];
	index[this.name] = (index[this.name] || []).concat(this);
};

Person.index = index;

Person.init = function(canvas){
	var name = location.hash.slice(1).replace("+"," "),
		offset = name.match("~\\d+$");
	if(offset){
		name = name.slice(0,-offset[0].length);
		offset = parseInt(offset[0].slice(1));
	} else offset = 0;

	var people = index[name] || [];

	if(people && offset<people.length){
		a = people[offset];
		a.display(canvas);
		return a;
	// display options in case of multiple people
	} else { // random
		a = Object.keys(index);
		a = a[Math.floor(Math.random()*a.length)];
		a = index[a];
		a = a[Math.floor(Math.random()*a.length)];
		a.link(canvas);
		return a;
	}
};

Person.prototype = {

	marry: function(spouse,date){
		if(this.sex==spouse.sex) throw "same-sex";
		this.spouse = spouse;
		spouse.spouse = this;
		this.anniversary = spouse.anniversary = date;
		return this;
	},

	child : function(child){
		if(!this.spouse) throw "not-married";
		this.children.push(child);
		this.spouse.children.push(child);
		if(this.sex==="M"){ child.father = this; child.mother = this.spouse; }
		else if(this.sex==="F"){ child.mother = this; child.father = this.spouse; }
		return this;
	},

	display_mouseover: function(e){
		mx = e.x - canvas.offsetLeft;
		my = e.y - canvas.offsetTop;
		var i = canvas.hyperlink.filter(function(i){
			return i.x1<=mx && mx<=i.x2
				&& i.y1<=my && my<=i.y2;
		});
		if(i.length){
			canvas.style.cursor = "pointer";
			canvas.hyperlink_now = i.pop().link;
		} else {
			canvas.style.cursor = "default";
			canvas.hyperlink_now = undefined;
		}
	},

	display_click: function(e){
		if(typeof(canvas.hyperlink_now)=="function")
			canvas.hyperlink_now();
	},

	display : function(canvas){

		canvas.hyperlink = [];
		canvas.removeEventListener("mousemove",this.display_mouseover)
		canvas.addEventListener("mousemove",this.display_mouseover);
		canvas.removeEventListener("click",this.display_click);
		canvas.addEventListener("click",this.display_click);

		var context = canvas.getContext("2d");
		context.beginPath();

		// Make a list of all those people whose names need to be displayed.
		var people = [this];
		if(this.father)
			people.push(this.father, this.mother),
			people.push.apply(people,this.father.children);
		if(this.spouse) people.push(this.spouse);		
		if(this.children) people.push.apply(people,this.children);

		// Detemine the dimensions of each box based on the largest name.
		context.font = fontsize+"px "+fontname;
		width = people.map(function(person){
			return context.measureText(person.name).width; });
		width = Math.max.apply(Math,width) + 2*padding;
		height = fontsize + 2*padding;

		// Appropriately set the canvas dimensions.
		var x = Math.max( (this.father?2:0),
			(this.father?this.father.children.length:1)+(this.spouse?1:0),
			this.children&&this.children.length );
		canvas.style.width = canvas.width = x*width+x*2*marginx;
		canvas.style.height = canvas.height = 3*height+6*marginy;

		// Parent Level
		var s;
		if(this.father){
			var x = width/2+marginx;
			var y = height/2+marginy;
			this.display_name(context, canvas.width/2-x, y, this.father);
			this.display_name(context, canvas.width/2+x, y, this.mother);
			draw_line(context, canvas.width/2-marginx, y, canvas.width/2+marginx, y);
			draw_line(context, canvas.width/2, y, canvas.width/2, 2*y);

			var c = this.father.children, i = c.indexOf(this);
			if(this.spouse){
				if(this.sex==="M") s = c.slice(0,i+1).concat( this.spouse ).concat( c.slice(i+1) );
				else s = c.slice(0,i).concat( this.spouse ).concat( c.slice(i) );
			} else s = c.slice(0);
		} else if(this.spouse){
			if(this.sex==="M") s = [this,this.spouse];
			else s = [this.spouse,this];
		} else {
			s = [this];
		}

		// Self, Spouse, Sibling Level
		if(this){
			var xd = width+2*marginx;
			var xi = canvas.width/2 - s.length*xd/2 + xd/2;
			var yi = height+2*marginy;
			var yd = height/2+marginy;
			if(this.father){
				var m = !this.spouse ? -1 : (this.sex==="M" ? i+1 : i);
				draw_line(context,  xi+(m==0?1:0)*xd, yi, xi+(m==s.length-1?m-1:s.length-1)*xd, yi );
			}
			for(var i=0; i<s.length; ++i){
				if(this.father && s[i]!=this.spouse)
					draw_line(context,  xi+i*xd, yi, xi+i*xd, yi+marginy );
				if(this.spouse && s[i]==this){
					var j = ( s[i+1]==this.spouse ? i : i-1 );
					draw_line(context,  xi+j*xd+width/2, yi+yd, xi+j*xd+width/2+2*marginx, yi+yd );
					var z = xi+j*xd+width/2+marginx;
				}
				this.display_name(context, xi+i*xd, yi+yd, s[i] );
			}
		}

		// Children Level
		if(this.children.length){
			var c = this.children;
			var xd = width+2*marginx;
			var xi = canvas.width/2 - c.length*xd/2 + xd/2;
			var yi = 2*height + 4*marginy;
			var yd = height/2 + marginy;
			for(var i=0; i<c.length; ++i){
				draw_line(context, xi+i*xd, yi, xi+i*xd, yi+marginy );
				this.display_name(context, xi+i*xd, yi+yd, c[i]);
			}
			draw_line(context,  z, yi-yd , z, yi );
			draw_line(context,  Math.min(z,xi), yi, Math.max(z,xi+xd*(c.length-1)), yi );
		}

		context.stroke();
	},

	display_name: function(context, x, y, person){
		context.lineWidth = 2;
		context.font = fontsize+"px "+fontname;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = (person==this?"blue":"black");

		xd = width/2; yd = height/2
		draw_rect(context, x-xd, y-yd, x+xd, y+yd, radius );
		context.fillText( person.name, x, y );
		context.canvas.hyperlink.push({
			x1:x-xd, y1:y-yd, x2:x+xd, y2:y+yd,
			link: person.link.bind(person,context.canvas)
		});
	},

	link: function(canvas){
		var offset = index[this.name].indexOf(this);
		var identifier = this.name.replace(" ","+")+(offset>0?"~"+offset:"");
		location.hash="#"+identifier;
		Person.init(canvas);
	}

};

var qget = function(name){
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var draw_line = function(context, x1,y1,x2,y2){
	context.moveTo(x1,y1);
	context.lineTo(x2,y2);
};

var draw_rect = function(context, x1,y1,x2,y2,r){
	context.moveTo(x2,y2-r);
	var c = [x2-r, y2-r, x1+r, y2-r, x1+r, y1+r, x2-r, y1+r];
	for(var i=0;i<4;++i) context.arc(c[i*2], c[i*2+1], r, i*0.5*Math.PI, (i+1)*0.5*Math.PI);
	context.lineTo(x2,y2-r);
};

Person.Male = function(name,dob){ return new Person("M",name,dob); };
Person.Female = function(name,dob){ return new Person("F",name,dob); };

return Person;
})();