var slvr = {
	elems:{
		xInput:false,
		yInput:false,
		grid:false,
		solutions:false,
	},
	
	grid:[],
	
	init() {
		slvr.buildHTML();
	},
	
	buildHTML() {
		var elem,
		
		elem = this.make(false, "div", "wrapper");
	
		// Control
		this.buildControl(elem);
		this.setGridValues();
		
		// Grid
		this.elems.grid = this.make(elem, "div", "container");
		this.elems.grid.addEventListener("keydown", function(e) { slvr.allowAlpha(e) });
		this.elems.grid.addEventListener("change", function() { slvr.validateGridValues() });
		this.elems.grid.addEventListener("mouseup", function() { slvr.validateGridValues() });
		this.elems.grid.addEventListener("keyup", function() { slvr.validateGridValues() });
		this.buildGrid();
		
		this.buildSubmit(elem);
		this.buildSolutions(elem);
	},
	
	buildControl(parent) {
		var elem1,
			elem2;
			
		elem1 = this.make(parent, "div", "control");
		this.elems.xInput = this.make(elem1, "input", false, {"type":"text","value":5});
		this.elems.xInput.addEventListener("keyup", function() {
			slvr.validateNumberInput(this);
			slvr.buildGrid();
			slvr.validateGridValues();
		});
		this.make(elem1, "span").textContent = "x";
		this.elems.yInput = this.make(elem1, "input", false, {"type":"text","value":5});
		this.elems.yInput.addEventListener("keyup", function() {
			slvr.validateNumberInput(this);
			slvr.buildGrid();
			slvr.validateGridValues();
		});
	},
	
	buildGrid() {
		var i,
			j,
			elem1,
			elem2,
			elem3;
		
		while (this.elems.grid.firstChild) { this.elems.grid.removeChild(this.elems.grid.firstChild) }
		
		for (i = 0; i < this.elems.yInput.value; i++) {
			elem1 = this.make(this.elems.grid, "div", "row");
			
			if (!this.grid[i]) { this.grid[i] = [] }
			for (j = 0; j < this.elems.xInput.value; j++) {
				if (!this.grid[i][j]) { this.grid[i][j] = this.getRandomLetter() }
				
				elem2 = this.make(elem1, "div", "block");
				elem3 = this.make(elem2, "input", false, {"value":this.grid[i][j]});
			}
		}
	},
	
	buildSubmit(parent) {
		var elem;
		
		this.make(parent, "br");
		this.make(parent, "br");
		elem = this.make(parent, "input", false, {"type":"button","value":"Solve"});
		elem.addEventListener("click", function() {
			var xhr,
				grid;
			
			grid = JSON.stringify(slvr.grid);
			
			xhr = new XMLHttpRequest();
			xhr.open("POST", "solver.php", true);
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xhr.send("grid="+grid);
			xhr.onload = function() {
				var data;
				
				console.log(this.responseText);
				
				try {
					data = JSON.parse(this.responseText);
					slvr.showSolutions(data);
				} catch(e) {}
			}
		});
	},
	
	buildSolutions(parent) {
		this.elems.solutions = this.make(parent, "div", "solutions");
	},
	
	showSolutions(data) {
		var i,
			parent;
		
		parent = this.elems.solutions;
		while (parent.firstChild) { parent.removeChild(parent.firstChild) }
		
		for (i = 0; i < data.length; i++) {
			this.make(parent, "div", "item").textContent = data[i];
		}
	},
	
	// Stores grid values into js memory
	setGridValues() {
		var i,
			j,
			elem1,
			elem2;
		
		this.grid = [];
		i = 0;
		elem1 = this.elems.grid.firstChild;
		while (elem1) {
			this.grid[i] = [];
			j = 0;
			elem2 = elem1.firstChild;
			
			while (elem2) {
				this.grid[i][j] = elem2.firstChild.value;
				elem2 = elem2.nextSibling;
				j++;
			}
			
			elem1 = elem1.nextSibling;
			i++;
		}
	},
	
	validateNumberInput(elem) {
		var val;
		val = elem.value.replace(/[^0-9]/g, "");
		elem.value = val;
	},
	
	validateGridValues() {
		var i,
			j,
			val,
			elem1,
			elem2;
		
		i = 0;
		elem1 = this.elems.grid.firstChild;
		while (elem1) {
			j = 0;
			elem2 = elem1.firstChild;
			while (elem2) {
				
				elem2.firstChild.value = elem2.firstChild.value.replace(/[^a-z]/g, "");
				
				if (elem2.firstChild.value.length > 0) {
					val = elem2.firstChild.value;
					elem2.firstChild.value = val.substr(val.length - 1);
				} else {
					elem2.firstChild.value = this.grid[i][j];
				}
				
				elem2 = elem2.nextSibling;
				j++;
			}
			elem1 = elem1.nextSibling;
			i++;
		}
		
		this.setGridValues();
	},
	
	// TO DO - preemtively validate
	allowAlpha(e) {
		
	},
	
	// UTILITY
	
	getRandomLetter() {
		var arr,
			rdm;
		
		arr = [
			"a","a","a","a",
			"b","b",
			"c","c",
			"d","d",
			"e","e","e","e",
			"f","f",
			"g","g",
			"h","h",
			"i","i","i","i",
			"j",
			"k",
			"l","l",
			"m","m",
			"n","n","n",
			"o","o","o","o",
			"p","p",
			"q",
			"r","r",
			"s","s",
			"t","t",
			"u","u","u",
			"v",
			"w","w",
			"x",
			"y","y","y",
			"z"
		];
		
		rdm = Math.round(Math.random() * (arr.length - 1));
		
		return arr[rdm];
	},
	
	make(parent, tag, cName, attributes) {
		var i,
			elem;
		
		elem = document.createElement(tag);
		if (cName) { elem.className = cName }
		
		for (i in attributes) {
			elem[i] = attributes[i];
		}
		
		(parent) ? parent.appendChild(elem) : document.body.appendChild(elem);
		
		return elem;
	}
}



window.addEventListener("load", slvr.init);

