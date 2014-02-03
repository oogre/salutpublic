(function(){
	"use strict";
	/*global window:false */
	/*global jQuery:false */
	/*global OGRE:false */

	jQuery().ready(function(){
		window.console.log("jQuery is ready");
		/* *********************** *\
		\*                         */
		/*       INIT OGRE         *\
		\* *********************** */
		
		OGRE().ready(function(){
			window.console.log("OGRE is ready");

		/* *********************** *\
		\*                         */
		/* RESPONSIVE VERTICAL ROW *\
		\* *********************** */
			document.querySelectorAll("[class*=\"ogre-row-\"]").map(function(elem){
				elem.classList.map(function(className){
					if(className.match("ogre-row-offset")){
						var setOffset = function(){
							var offset = parseInt(className.split("offset-").pop());
							offset = offset * window.innerHeight / 12;
							elem.style.marginTop = offset + "px";
						};
						window.addEventListener("resize", setOffset, false);
						setOffset();
					}
					else if(className.match("ogre-row-")){
						var setSize = function(){
							var size = parseInt(className.split("ogre-row-").pop());
							size = size * window.innerHeight / 12;
							elem.style.marginBottom = size + "px";
						};
						window.addEventListener("resize", setSize, false);
						setSize();
					}
				});
			});

		/* *********************** *\
		\*                         */
		/*   RESPONSIVE ANIMATION  *\
		\* *********************** */
			document.querySelectorAll(".anim").map(function(elem){
				var setSpeed = function(){
					var d = window.innerWidth;
					var v = 900.0;
					var t = d / v;
					elem.style.transitionDuration = t + "s";
					elem.style.oTransitionDuration = t + "s";
					elem.style.mozTransitionDuration = t + "s";
					elem.style.webkitTransitionDuration = t + "s";
				};
				window.addEventListener("resize", setSpeed, false);
				setSpeed();
			});
		
		/* *********************** *\
		\* NAV                     */
		/* ANIMATION + INTERACTION *\
		\* *********************** */
			var nav = document.querySelector("#nav");
			nav.togglePosition = function(){
				this.classList.toggle("right");
				this.classList.toggle("left");
				return this;
			};
			nav.querySelectorAll("a").map(function(elem){
				elem.addEventListener("click", function(){
					transition(elem.getAttribute("href"));
				}, false);
			});

		/* *********************** *\
		\* CHANGE CURRENT PAGE     */
		/* ANIMATION               *\
		\* *********************** */
			var current = document.querySelector(".current");
			var transition = function(id){
				if(id.match("article")){
					id = "#" + id.substr(1, id.length).split("#").shift();
				}

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
				current.classList.add(nav.classList.contains("right") ? "left" : "right");
				
				var newCurrent = document.querySelector(id);
				if(newCurrent !== current){
					nav.togglePosition();
					current = newCurrent;
				}

				current.classList.add("current");
				current.classList.remove("out");
				current.classList.remove("smooth");
				current.classList.remove("right");
				current.classList.remove("left");
				current.classList.remove("hide");
				current.scrollTop = current.getAttribute("scrollTop") || 0;
			};

		/* *********************** *\
		\* CONTENT ORGANISATION    */
		/* GUI                     *\
		\* *********************** */
			OGRE.GUI = (function(){
				var _sections = [];
				
				var Section = function(name){
					var self = document.querySelector("#" + name);
					self.articles = [];
					self.name = name;
					self.initArticle = function(rawArticle, onclick){
						this.articles.push(new Article(self, rawArticle, onclick));
						return this.articles.last();
					};
					self.dispatchRequestArticle = function(article){
						this.dispatchEvent(new CustomEvent("requestarticle", {
							detail: article.current
						}));
					};
					return self;
				};

				var Article = function(parent, rawArticle, onclick){
					var self = document.createElement("li");
					self.parent = parent;
					self.name = rawArticle.name;
					self.title = rawArticle.title;
					self.date = rawArticle.date;
					self.appendChild(document.createElement("a"));
					self.children[0].href = "#article#"+self.name;
					self.children[0].addEventListener("click", onclick, false);
					self.children[0].appendChild(document.createElement("ul"));
					parent.querySelector("ul").appendChild(self);
					
					self.elements = [];
					for(var name in rawArticle.content){
						var content = rawArticle.content[name];
						self.elements.push(new Element(self, name, content));
					}
					self.elements = new OGRE.TOOLS.Iterator(self.elements);
					self.elements.current.initItem();
					self.loadElements = function(){
						while(self.elements.hasNext()){
							self.elements.next().current.initItem();
						}
					};
					return self;
				};

				var Element = function(parent, name, content){
					var self = document.createElement("li");
					self.appendChild(document.createElement("a"));
					parent.children[0].style.width= "100%";
					parent.children[0].style.height= "100%";
					parent.children[0].style.display= "block";
					parent.children[0].children[0].appendChild(self);
					parent.children[0].children[0].style.width = parent.children[0].children[0].children.length * 100 + "%";
					content = content.map(function(c){
						return parent.parent.name + "/"+parent.name+"/"+name+"/"+c;
					});
					return {
						article : parent,
						name : name,
						initItem : function(name){
							OGRE.TOOLS.easyloader(self.children[0], content, 500*300);
						}
					};
				};

				var _initSection = function(name){
					return _sections.get(name) || _sections.add(new Section(name)).last();
				};

				return {
					sections : _sections,
					createSection : function(name){
						return new Section(name);
					}
				};
			})();

		/* *********************** *\
		\* LOAD ARTICLES           */
		/*                         *\
		\* *********************** */

			OGRE.DATA = {};
			OGRE.TOOLS.getArticles("http://lab.ogre.be/salutpublic/archive", "archive", function(archives, section){
				var _section = OGRE.GUI.createSection(section);
				_section.addEventListener("requestarticle", function(event){
					this.initArticle(event.detail, function(){
						var t = this.scrollLeft;
						this.scrollLeft+=500;
						if(t == this.scrollLeft){
							this.scrollLeft = 0;
						}
						return false;
					}).loadElements();
				}, false);
				
				OGRE.DATA.archive = new OGRE.TOOLS.Iterator(archives);
				_section.dispatchRequestArticle(OGRE.DATA.archive);

				var smartloader = function(){
					while(OGRE.DATA.archive.hasNext() && 200 > _section.scrollHeight - _section.scrollTop - _section.offsetHeight){
						_section.dispatchRequestArticle(OGRE.DATA.archive.next());
					}
				};
				smartloader();

				_section.addEventListener("scroll", smartloader, false);
				window.addEventListener("resize", smartloader, false);
			});


			OGRE.TOOLS.getArticles("http://lab.ogre.be/salutpublic/home", "home", function(homes, section){
				var _section = OGRE.GUI.createSection(section);
				_section.addEventListener("requestarticle", function(event){
					this.initArticle(event.detail, function(){
						transition(this.getAttribute("href"));
					});
				}, false);
				
				OGRE.DATA.home = new OGRE.TOOLS.Iterator(homes);
				_section.dispatchRequestArticle(OGRE.DATA.home);

				var smartloader = function(){
					while(OGRE.DATA.home.hasNext() && 200 > _section.scrollHeight - _section.scrollTop - _section.offsetHeight){
						_section.dispatchRequestArticle(OGRE.DATA.home.next());
					}
				};
				smartloader();

				_section.addEventListener("scroll", smartloader, false);
				window.addEventListener("resize", smartloader, false);
			});


		/* *********************** *\
		\* HASH REDIRECTION        */
		/*                         *\
		\* *********************** */
			if(window.location.hash.match("#")){
				transition(window.location.hash);
			}
		});
	});
})();
