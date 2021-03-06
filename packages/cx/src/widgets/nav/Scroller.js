import {Icon} from "../Icon";
import {VDOM} from '../../ui/Widget';
import {Container} from '../../ui/Container';
import {ResizeManager} from '../../ui/ResizeManager';
import {isString, scrollElementIntoView} from "../../util";

export class Scroller extends Container {
   init() {
      if (!this.vertical)
         this.horizontal = true; //default

      super.init();
   }

   declareData(...args) {
      super.declareData(...args, {
         scrollIntoViewSelector: undefined,
      });
   }

   render(context, instance, key) {
      let {data} = instance;

      return <HScrollerComponent key={key} widget={this} data={instance.data} scrollIntoViewSelector={data.scrollIntoViewSelector}>
         {this.renderChildren(context, instance)}
         </HScrollerComponent>
   }
}

Scroller.prototype.styled = true;
Scroller.prototype.baseClass = "scroller";

export class HScrollerComponent extends VDOM.Component {

   constructor(props) {
      super(props);
      this.stopScrolling = () => {
         delete this.doScroll;
      };
      this.scrollLeft = () => this.scroll('left');
      this.scrollRight = () => this.scroll('right');
      this.scrollUp = () => this.scroll('up');
      this.scrollDown = () => this.scroll('down');
      this.state = {scrollable: false};
   }

   render() {
      let {data, children, widget} = this.props;
      let {CSS, baseClass} = widget;

      return <div
      className={CSS.expand(data.classNames, CSS.state({
            scrollable: this.state.scrollable,
            horizontal: widget.horizontal,
            vertical: widget.vertical,
         }))}
      style={data.style}
      scrollIntoViewSelector={data.scrollIntoViewSelector}
      ref = {el => {this.el = el}}
   >
      {
         widget.horizontal &&
         <div
         className={CSS.element(baseClass, "left-arrow")}
         onMouseDown={this.scrollLeft}
         onTouchStart={this.scrollLeft}
         onMouseUp={this.stopScrolling}
         onTouchEnd={this.stopScrolling}
            >
            {Icon.render("drop-down", {className: CSS.element(baseClass, "icon")})}
            </div>
      }

      {
         widget.horizontal &&
         <div
         className={CSS.element(baseClass, "right-arrow")}
         onMouseDown={this.scrollRight}
         onTouchStart={this.scrollRight}
         onMouseUp={this.stopScrolling}
         onTouchEnd={this.stopScrolling}
            >
            {Icon.render("drop-down", {className: CSS.element(baseClass, "icon")})}
            </div>
      }

      {
         widget.vertical && <div
         className={CSS.element(baseClass, "top-arrow")}
         onMouseDown={this.scrollUp}
         onTouchStart={this.scrollUp}
         onMouseUp={this.stopScrolling}
         onTouchEnd={this.stopScrolling}
            >
            {Icon.render("drop-down", {className: CSS.element(baseClass, "icon")})}
            </div>
      }

      {
         widget.vertical && <div
         className={CSS.element(baseClass, "bottom-arrow")}
         onMouseDown={this.scrollDown}
         onTouchStart={this.scrollDown}
         onMouseUp={this.stopScrolling}
         onTouchEnd={this.stopScrolling}
            >
            {Icon.render("drop-down", {className: CSS.element(baseClass, "icon")})}
            </div>
      }

   <div className={CSS.element(baseClass, "clip")} ref={el => {
         this.clip = el;
      }}>
   <div className={CSS.element(baseClass, "scroller")} ref={el => {
         this.scroller = el;
      }}>
   <div className={CSS.element(baseClass, "content")} ref={el => {
         this.content = el;
      }}>
      {children}
   </div>
      </div>
      </div>
      </div>
   }

   componentDidMount() {
      this.unsubscribeResize = ResizeManager.trackElement(this.clip, ::this.componentDidUpdate);
      this.componentDidUpdate();
   }

   componentDidUpdate() {
      let {widget} = this.props;
      let scrollable = false;
      if (widget.horizontal) {
         let scrollSize = this.scroller.offsetHeight - this.scroller.clientHeight;
         this.scroller.style.marginBottom = `${-scrollSize}px`;
         if (this.content.scrollWidth > this.clip.clientWidth)
            scrollable = true;
      }
      if (widget.vertical) {
         let scrollSize = this.scroller.offsetWidth - this.scroller.clientWidth;
         this.scroller.style.marginRight = `${-scrollSize}px`;
         if (this.content.scrollHeight > this.clip.clientHeight)
            scrollable = true;
      }
      if (scrollable != this.state.scrollable)
         this.setState({scrollable})

      this.scrollIntoView();
   }

   componentWillUnmount() {
      this.unsubscribeResize();
   }

   scroll(direction) {
      this.doScroll = () => {
         if (!this.scroller)
            return;

         switch (direction) {
            case "left":
               this.scroller.scrollLeft -= 10;
               break;

            case "right":
               this.scroller.scrollLeft += 10;
               break;

            case "up":
               this.scroller.scrollTop -= 10;
               break;

            case "down":
               this.scroller.scrollTop += 10;
               break;
         }

         if (this.doScroll)
            requestAnimationFrame(this.doScroll);
      };
      this.doScroll();
   }

   scrollIntoView() {
      let {scrollIntoViewSelector, widget} = this.props;

      if (scrollIntoViewSelector && isString(scrollIntoViewSelector)){

         let child = this.el.querySelector(scrollIntoViewSelector);

         if (!child){
            let childrenForClass = this.el.getElementsByClassName(scrollIntoViewSelector);
            if (childrenForClass && childrenForClass.length)
               child = childrenForClass[0];
         }

         if (child)
            scrollElementIntoView(child, widget.vertical, widget.horizontal)
      }
   }
}

export class HScroller extends Scroller {
}

HScroller.prototype.horizontal = true;


export class VScroller extends Scroller {
}

VScroller.prototype.vertical = true;