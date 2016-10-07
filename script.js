var solver = {
	ids:{
		wrapper:"wrapper",
		inputWidth:"input-width",
		inputHeight:"input-height",
		grid:"grid",
	},
	
	rows:3,
	cols:3,
	
	grid:[
		["a", "b", "c"],
		["o", "g", "e"],
		["t", "r", "y"],
	],
	
	tileW:50,
	
	init() {
		solver.initStyle();
		solver.createHTML();
		solver.responsive();
		
	},
	
	initStyle() {
		var elem,
			style;
		
		style = "html, body, div { padding:0; margin:0; }";
		elem = document.createElement("style");
		elem.type = "text/css";
		elem.textContent = style;
		document.head.appendChild(elem);
	},
	
	responsive() {
		solver.sizeGrid();
	},
	
	sizeGrid() {
		var width;
		
		width = document.body.clientWidth - document.getElementById(this.ids.grid).clientWidth;
		document.getElementById(this.ids.grid).style.marginLeft = parseInt(width/2) + "px";
	},

	createHTML() {
		var i,
			elem1,
			elem2,
			elem3;
		
		if (document.body.firstChild) {
			while (document.body.firstChild) { document.body.removeChild(document.body.firstChild); }
		}
		
		elem1 = document.createElement("div");
		elem1.id = this.ids.wrapper;
		elem1.style.fontFamily = "sans-serif";
		elem1.style.margin = "0 auto";
		
		this.createGridSizer(elem1);
		this.createGrid(elem1);
		
		document.body.appendChild(elem1);
	},
	
	createGridSizer(parent) {
		var temp,
			elem1,
			elem2;
			
		temp = this;
		
		elem1 = document.createElement("div");
		elem1.style.textAlign = "center";
		elem1.style.marginBottom = "20px";
		
		elem2 = document.createElement("input");
		elem2.type = "text";
		elem2.id = this.ids.inputWidth;
		elem2.value = this.cols;
		elem2.style.width = "20px";
		elem2.style.fontSize = "15px";
		elem2.style.textAlign = "right";
		elem2.addEventListener("change", function() { temp.adjustGridSize() });
		elem2.addEventListener("keyup", function() { temp.adjustGridSize() });
		elem2.addEventListener("mouseup", function() { temp.adjustGridSize() });
		elem1.appendChild(elem2);
		
		elem2 = document.createElement("span");
		elem2.textContent = "x";
		elem2.style.margin = "0 10px";
		elem1.appendChild(elem2);
		
		elem2 = document.createElement("input");
		elem2.type = "text";
		elem2.id = this.ids.inputHeight;
		elem2.value = this.rows;
		elem2.style.width = "20px";
		elem2.style.fontSize = "15px";
		elem2.style.textAlign = "right";
		elem2.addEventListener("change", function() { temp.adjustGridSize() });
		elem2.addEventListener("keyup", function() { temp.adjustGridSize() });
		elem2.addEventListener("mouseup", function() { temp.adjustGridSize() });
		elem1.appendChild(elem2);
		
		parent.appendChild(elem1);
	},
	
	createGrid(parent) {
		var i,
			j,
			columns,
			rows,
			parent,
			elem1,
			elem2;
			
		columns = this.getColumns();
		rows = this.getRows();
		if (!parent) { parent = document.getElementById(this.ids.wrapper); }
		
		if (document.getElementById(this.ids.grid)) {
			parent.removeChild(document.getElementById(this.ids.grid));
		}
		
		elem1 = document.createElement("div");
		elem1.id = this.ids.grid;
		elem1.style.display = "inline-block";
		parent.appendChild(elem1);
		
		for (i = 0; i < rows; i++) {
			elem2 = document.createElement("div");
			elem2.style.height = parseInt(this.tileW + 2) + "px";
			for (j = 0; j < columns; j++) { this.createTile(elem2, i, j);	}
			elem1.appendChild(elem2);
		}
	},
	
	createTile(parent, row, col) {
		var elem1,
			elem2,
			temp;
		
		temp = this;
		
		elem1 = document.createElement("div");
		elem1.style.width = this.tileW + "px";
		elem1.style.height = this.tileW + "px";
		elem1.style.fontSize = this.tileW + "px";
		elem1.style.display = "inline-block";
		elem1.style.border = "1px solid #888";
		elem1.style.overflow = "hidden";
		
		elem2 = document.createElement("input");
		elem2.type = "text";
		elem2.style.width = this.tileW + "px";
		elem2.style.height = this.tileW + "px";
		elem2.style.border = "none";
		elem2.style.textTransform = "uppercase";
		elem2.style.fontSize = parseInt(this.tileW) - 10 + "px";
		elem2.style.textAlign = "center";
		elem2.style.verticalAlign = "top";
		elem2.addEventListener("keyup", function() { temp.validateTile(this) });
		elem2.addEventListener("change", function() { temp.validateTile(this) });
		elem2.addEventListener("mouseup", function() { temp.validateTile(this) });
		if (this.grid[row] && this.grid[row][col]) { elem2.value = this.grid[row][col]; }
		elem2.id = row + "-" + col;
		elem1.appendChild(elem2);
		
		parent.appendChild(elem1);
	},
	
	validateTile(elem) {
		elem.value = elem.value.replace(/[^a-zA-Z]/g, "");
		elem.value = elem.value.substr(-1, 1);
		elem.value = elem.value.toUpperCase();
	},
	
	adjustGridSize() {
		var i,
			j,
			parent,
			elem1,
			elem2;
		
		this.setRows();
		this.setColumns();
		
		parent = document.getElementById(this.ids.grid);
		while (parent.firstChild) { parent.removeChild(parent.firstChild) }
		
		for (i = 0; i < this.rows; i++) {
			elem1 = document.createElement("div");
			elem1.style.height = "52px";
			for (j = 0; j < this.cols; j++) { this.createTile(elem1, i, j) }
			parent.appendChild(elem1);
		}
	},
	
	setColumns() {
		this.cols = document.getElementById(this.ids.inputWidth).value;
	},
	
	getColumns() {
		return this.cols
	},
	
	setRows() {
		this.rows = document.getElementById(this.ids.inputHeight).value;
	},
	
	getRows() {
		return this.rows
	},
	
	parseDimension(dim) {
		if (dim != parseInt(dim)) { return 0; }
		
		return parseInt(dim);		
	},
}

window.addEventListener("load", solver.init);
window.addEventListener("resize", solver.responsive);