/*
---
description: A MooTools class to provide a sortable nested tree structure

license: MIT-style

authors:
- Ryan Mitchell

requires:
- core/1.3.0: '*'

provides: [NestedSortables]

...
*/
var NestedSortables = new Class({

	Implements: [Options, Events],
	
	options: {
		childTag: 'li',
		ghost: true,
		childStep: 30, // attempts to become a child if the mouse is moved this number of pixels right
		handleClass: null, 
		onStart: Class.empty,
		onComplete: Class.empty,
		collapse: false, // true/false
		collapseClass: 'nCollapse', // Class added to collapsed items
		expandKey: 'shift', // control | shift
		lock: null, // parent || depth || class
		lockClass: 'unlocked'
	},
	
	initialize: function(list, options){
	
		this.setOptions(options);
	
		if (!this.options.expandKey.match(/^(control|shift)$/)){
			this.options.expandKey = 'shift';
		}
	
		this.list = document.id(list);
	
		this.options.childTag = this.options.childTag.toLowerCase();
		this.options.parentTag = this.list.get('tag').toLowerCase();
	
		this.bound = {};
		this.bound.start = this.start.bind(this);
	
		this.list.addEvent('mousedown', this.bound.start);
	
		if (this.options.collapse){
			this.bound.collapse = this.collapse.bind(this);
			this.list.addEvent('click', this.bound.collapse);
		}
	
		this.fireEvent('initialized', this);
		
	},

	start: function(event){
		
		var el = document.id(event.target);
	
		if (this.options.handleClass){
			while (el.get('tag').toLowerCase() != this.options.childTag && !el.hasClass(this.options.handleClass) && el != this.list){
				el = el.getParent();
			}
			if (!el.hasClass(this.options.handleClass)) return true;
		} 
		
		while (el.get('tag').toLowerCase() != this.options.childTag && el != this.list){
			el = el.parentNode;
		}

		// bugs out here		
		if (el.get('tag').toLowerCase() != this.options.childTag) return true;
		
		el = document.id(el);
		
		if (this.options.lock == 'class' && !el.hasClass(this.options.lockClass)) return;
		
		if (this.options.ghost){ // Create the ghost
			this.ghost = el.clone()
			.setStyles({
				'list-style-type': 'none',
				'opacity': 0.5,
				'position': 'absolute',
				'visibility': 'hidden',
				'top': event.page.y+'px',
				'left': (event.page.x+10)+'px'
			}).inject(document.body, 'inside');
		}
		
		el.depth = this.getDepth(el);
		el.moved = false;
		
		var self = this;
		this.bound.movement = function(ev){ self.movement(ev, el); };//this.movement.bind(this, el);
		this.bound.end = function(ev) { self.end(ev, el); };//this.end.bind(this, el);
		
		this.list.removeEvent('mousedown', this.bound.start);
		this.list.addEvent('mousedown', this.bound.end);
		this.list.addEvent('mousemove', this.bound.movement);
		document.addEvent('mouseup', this.bound.end);
		
		if (Browser.ie6 || Browser.ie7){ // IE fix to stop selection of text when dragging
			this.bound.stop = this.stop.bind(this);
			document.id(document.body).addEvent('drag', this.bound.stop).addEvent('selectstart', this.bound.stop);
		}
		
		this.fireEvent('start', el);
		
		event.stop();
		
	},
	
	collapse: function(event){
	
		var el = document.id(event.target);
		
		if (this.options.handleClass){
			while (el.get('tag').toLowerCase() != this.options.childTag && !el.hasClass(this.options.handleClass) && el != this.list){
				el = el.getParent();
			}
			if (!el.hasClass(this.options.handleClass)){
				return true;
			}
		} 
		
		while (el.get('tag').toLowerCase() != this.options.childTag && el != this.list){
			el = el.getParent();
		}
		
		if (el == this.list) return;
		
		el = document.id(el);
		
		if (!el.moved){
			
			var sub = el.getElement(this.options.parentTag);
			
			if (sub){
				if (sub.getStyle('display') == 'none'){
					sub.setStyle('display', 'block');
					el.removeClass(this.options.collapseClass);
				} else {
					sub.setStyle('display', 'none');
					el.addClass(this.options.collapseClass);
				}
			}
			
		}
		
		event.stop();
		
	},
	
	stop: function(event){
		event.stop();
		return false;
	},
	
	getDepth: function(el, add){
	
		var counter = (add) ? 1 : 0;
	
		while (el != this.list){
			if (el.get('tag').toLowerCase() == this.options.parentTag){
				counter += 1;
			}
			el = el.getParent();
		}
	
		return counter;
	
	},
	
	detach: function(){
		this.list.removeEvent('mousedown', this.start.bind(this));
		if (this.options.collapse){
			this.list.removeEvent('click', this.bound.collapse);
		}
	},

	end: function(event, el){
	
		if (this.options.ghost) this.ghost.destroy();
		
		this.list.removeEvent('mousemove', this.bound.movement);
		this.list.removeEvent('mousedown', this.bound.end);
		this.list.addEvent('mousedown', this.bound.start);
		
		document.removeEvent('mouseup', this.bound.end);
		
		this.fireEvent('complete', el);
		
		if (Browser.ie){
			document.id(document.body)
			.removeEvent('drag', this.bound.stop)
			.removeEvent('selectstart', this.bound.stop);
		}
		
	},
	
	movement: function(event, el){
		
		var dir, over, check, items;
		var dest, move, prev, prevParent;
		var abort = false;
		
		if (this.options.ghost && el.moved){ // Position the ghost
			this.ghost.setStyles({
				'position': 'absolute',
				'visibility': 'visible',
				'top': event.page.y+'px',
				'left': (event.page.x+10)+'px'
			});
		}
		
		over = event.target;
		
		while (over.get('tag').toLowerCase() != this.options.childTag && over != this.list){
			over = over.getParent();
		}
		
		if (over == this.list) return;
		
		if (event[this.options.expandKey] && over != el && over.hasClass(this.options.collapseClass)){
			check = over.getElement(this.options.parentTag);
			over.removeClass(this.options.collapseClass);
			check.setStyle('display', 'block');
		}
		
		// Check if it's actually inline with a child element of the event firer
		orig = over;
		if (el != over){
			items = over.getElements(this.options.childTag);
			items.each(function(item){
				if (event.page.y > item.getCoordinates().top && item.offsetHeight > 0){
					over = item;
				}
			});
		}
		
		// Make sure we end up with a childTag element
		if (over.get('tag').toLowerCase() != this.options.childTag) return;
			
		// store the previous parent 'ol' to remove it if a move makes it empty
		prevParent = el.getParent();
		dir = (event.page.y < el.getCoordinates().top) ? 'up' : 'down';
		move = 'before';
		dest = el;

		if (el != over){
		
			check = over;
			
			while (check != null && check != el){
				check = check.getParent();
			} // Make sure we're not trying to move something below itself
			
			if (check == el) return;
			
			if (dir == 'up'){
				move = 'before'; 
				dest = over;
			} else {
				sub = over.getElement(this.options.childTag);
				
				if (sub && sub.offsetHeight > 0){
					move = 'before'; 
					dest = sub;
				} else {
					move = 'after'; 
					dest = over;
				}
				
			}
		}

		// Check if we're trying to go deeper -->>
		prev = (move == 'before') ? dest.getPrevious() : dest;
		
		if (prev){
			move = 'after';
			dest = prev;
			check = dest.getElement(this.options.parentTag);
			while (check && event.page.x > check.getCoordinates().left && check.offsetHeight > 0){
				dest = check.getLast();
				check = dest.getElement(this.options.parentTag);
			}
			if (!check && event.page.x > dest.getCoordinates().left+this.options.childStep){
				move = 'inside';
			}
		}

		last = dest.getParent().getLast();
		
		while (((move == 'after' && last == dest) || last == el) && dest.getParent() != this.list && event.page.x < dest.getCoordinates().left){
			move = 'after';
			dest = document.id(dest.parentNode.parentNode);
			last = dest.getParent().getLast();
		}
		
		abort = false;
		if (move != ''){
			abort += (dest == el);
			abort += (move == 'after' && dest.getNext() == el);
			abort += (move == 'before' && dest.getPrevious() == el);
			abort += (this.options.lock == 'depth' && el.depth != this.getDepth(dest, (move == 'inside')));
			abort += (this.options.lock == 'parent' && (move == 'inside' || dest.parentNode != el.parentNode));
			abort += (this.options.lock == 'list' && this.getDepth(dest, (move == 'inside')) == 0);
			abort += (dest.offsetHeight == 0);
			sub = over.getElement(this.options.parentTag);
			sub = (sub) ? sub.getCoordinates().top : 0;
			sub = (sub > 0) ? sub-over.getCoordinates().top : over.offsetHeight;
			abort += (event.page.y < (sub-el.offsetHeight)+over.getCoordinates().top);
			if (!abort){
				if (move == 'inside') dest = new Element(this.options.parentTag).inject(dest, 'inside');
				document.id(el).inject(dest, move);
				el.moved = true;
				if (!prevParent.getFirst()) prevParent.destroy();
			}
		}
		
		event.stop();
	}
	
});