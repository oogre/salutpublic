jQuery().ready(function(){
	
	console.log("jQuery is ready");
	OGRE().ready(function(G){
		console.log("OGRE is ready");
		
	/* RESPONSIVE VERTICAL ROW */
		document.querySelectorAll('[class*="ogre-row-"]').map(function(elem){
			elem.classList.map(function(className){
				if(className.match("ogre-row-offset")){
					var setOffset = function(){
						var offset = parseInt(className.split("offset-").pop());
						var offset = offset * window.innerHeight / 12;
						elem.style.marginTop = offset + "px";	
					}
					window.addEventListener("resize", setOffset, false);
					setOffset();
				}
				else if(className.match("ogre-row-")){
					var setSize = function(){
						var size = parseInt(className.split("ogre-row-").pop());
						var size = size * window.innerHeight / 12;
						elem.style.marginBottom = size + "px";	
					}
					window.addEventListener("resize", setSize, false);
					setSize();
				}
			});
		});

	/* RESPONSIVE ANIMATION */
		document.querySelectorAll('.anim').map(function(elem){
			var setSpeed = function(){
				var d = window.innerWidth;
				var v = 900.0;
				var t = d / v;
				elem.style.transitionDuration = t + "s";
				elem.style.oTransitionDuration = t + "s";
				elem.style.mozTransitionDuration = t + "s";
				elem.style.webkitTransitionDuration = t + "s";
			}
			window.addEventListener("resize", setSpeed, false);
			setSpeed();
		});

	/* NAV */
		var nav = document.querySelector("#nav");
		nav.togglePosition = function(){
			this.classList.toggle("right");
			this.classList.toggle("left");
			return this;
		};
		nav.querySelectorAll("a").map(function(elem){
			elem.addEventListener("click", function(event){
				nav.togglePosition();
				transition(elem.getAttribute("href"));
			}, false);
		});

	/* CURRENT */
		var current = document.querySelector(".current");
	
	/* TRANSITION */
		var transition = function(id){
			var out = document.querySelector(".out");
			if(out){
				out.classList.remove("smooth");
				out.classList.remove("left");
				out.classList.remove("right");
				out.classList.remove("out");
				out.classList.add("hide");
			}
			
			current.setAttribute("scrollTop", current.scrollTop);
			current.parentNode.insertBefore(document.querySelector(id), current);
			current.classList.add("smooth");
			current.classList.remove("current");
			current.classList.add("out");
			current.classList.add(nav.classList.contains("right") ? "right" : "left");

			current = document.querySelector(id);
			current.classList.add("current");
			current.classList.remove("out");
			current.classList.remove("smooth");
			current.classList.remove("right");
			current.classList.remove("left");
			current.classList.remove("hide");
			current.scrollTop = current.getAttribute("scrollTop") || 0;
		}

	/* HOME */
		OGRE.GUI = (function(){
			var _sections = OGRE.TOOLS.Team();
			
			var Section = function(name){
				var self = document.querySelector("#" + name); 
				self.articles = OGRE.TOOLS.Team(),
				self.name = name;
				self.initArticle = function(name){
					return this.articles.get(name) || this.articles.add(new Article(self, name)).last();
				}
				return self;
			};

			var Article = function(parent, name){
				var _elements = OGRE.TOOLS.Team();
				var _title = name.split("_").pop();
				var _date = name.split("_").shift();
				return {
					nodeHTML : null,
					section : parent,
					title : _title,
					date : _date,
					elements : _elements,
					name : name,
					initElement : function(name){
						return this.elements.get(name) || this.elements.add(new Element(this, name)).last();
					},
					open : function(){
						console.log(_elements);
						console.log("INJECT ELEMENTS INTO SECTION detail");
						nav.togglePosition();
						transition("#detail");
					},
					load : function(){
						var self = this;
						this.nodeHTML = document.createElement("li");
						
						this.nodeHTML.addEventListener("click", this.open, false);

						this.section.querySelector("ul").appendChild(this.nodeHTML)
						return OGRE.TOOLS.easyloader([this.section.name, name, this.elements[0].name, ""].join("/"), this.nodeHTML);
					}
				}
			};

			var Element = function(parent, name){
				var _items = OGRE.TOOLS.Team();
				return {
					article : parent,
					item : _items,
					name : name,
					initItem : function(name){
						return _items.get(name) || _items.add(new Item(this, name)).last();
					}
				}
			};

			var Item = function(parent, name){
				var _items = OGRE.TOOLS.Team();
				return {
					element : parent,
					name : name
				}
			};

			var _initSection = function(name){
				return _sections.get(name) || _sections.add(new Section(name)).last();
			};

			return {
				sections : _sections,
				addContent : function(content){
					var sectionName = content.shift();
					var articleName = content.shift();
					var elementName = content.shift();
					var itemName = content.shift();
					_initSection(sectionName).initArticle(articleName).initElement(elementName).initItem(itemName);
				}
			}
		})();

	/* LOAD ARTICLES */
		OGRE.TOOLS.getFiles("home/", function(files){
			var sectionName = Array.prototype.slice.call(files).first().first();
			Array.prototype.slice.call(files).map(function(file){
				OGRE.GUI.addContent(file);
			});
			var articles = OGRE.GUI.sections.get(sectionName).articles.reverse();
		
			OGRE.GUI.articles = new OGRE.TOOLS.Iterator(articles);

			var smartloader = function(){
				var section = OGRE.GUI.articles.current.section;
				if(OGRE.GUI.articles.hasNext() && 200 > section.scrollHeight - section.scrollTop - section.offsetHeight){
					OGRE.GUI.articles.next().current.load();
				}
			};

			var rawload = function(){
				var current = OGRE.GUI.articles.current;
				var section = OGRE.GUI.articles.current.section;
				current.load()
				if(OGRE.GUI.articles.hasNext() && 200 > section.scrollHeight - section.scrollTop - section.offsetHeight){
					setTimeout(function(){
						OGRE.GUI.articles.next();
						rawload();	
					}, 50);
				}
			};
			rawload();
			OGRE.GUI.articles.current.section.addEventListener("scroll", smartloader, false);
			window.addEventListener("resize", smartloader, false);
		});
	});
});