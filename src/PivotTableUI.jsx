import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {PivotData, sortAs, getSort, getAllAttributes, naturalSort} from './Utilities';
import PivotTable from './PivotTable';
import Sortable from 'react-sortablejs';
import Draggable from 'react-draggable';
import ConfigModal from './PivotTableModal';

const colors = [
  "#ECF5FF",
  "#D2E9FF",
  "#C4E1FF",
  "#ACD6FF",
  "#97CBFF",
  "84C1FF",
  "ECFFFF",
]
/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

export class DraggableAttribute extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false, filterText: '', curHeight: 0, hover:false};
  }

  toggleValue(value) {
    if (value in this.props.valueFilter) {
      this.props.removeValuesFromFilter(this.props.name, [value]);
    } else {
      this.props.addValuesToFilter(this.props.name, [value]);
    }
  }

  matchesFilter(x) {
    // change to multiple conditions
    const allowedSigns = ['>', '<', '=']
    const filterText = this.state.filterText.toLowerCase().trim();
    const conditions = filterText.split(',');
    const containSign = allowedSigns.findIndex(sign=>filterText.includes(sign)) !== -1;
    let equation="";
    if(containSign){
        try {
          if(typeof x === "string"){
            // try to convert to number
            // console.log(x)
            const numerValue = parseFloat(x, 10);
            console.log(numerValue)
            if(!isNaN(numerValue)){
              x = numerValue;
            }
          }
            equation = eval(filterText)
          }catch(e){
            // ignore error
        };
    }
    // return x
    //   .toLowerCase()
    //   .trim()
    //   .includes(this.state.filterText.toLowerCase().trim());
    return equation && equation !== "" && !isNaN(x) ? equation: conditions.findIndex(cond=>String(x).toLowerCase().trim().includes(cond.trim())) !== -1;
  }

  selectOnly(e, value) {
    e.stopPropagation();
    this.props.setValuesInFilter(
      this.props.name,
      Object.keys(this.props.attrValues).filter(y => y !== value)
    );
  }

  getFilterBox() {
    const showMenu =
      Object.keys(this.props.attrValues).length < this.props.menuLimit;

    const values = Object.keys(this.props.attrValues);
    const shown = values
      .filter(this.matchesFilter.bind(this))
      .sort(this.props.sorter);
     
   const divStyle = {
      display: 'block',
      cursor: 'initial',
      zIndex: this.props.zIndex,
    };
    if(this.props.rowHeight) {
      divStyle.top = this.props.rowHeight;
    }
    if(this.props.searchDropDown) {// modified for search filter box
      divStyle.right = '40px' 
    }
    return (
      <Draggable handle=".pvtDragHandle">
        <div
          className="pvtFilterBox"
          style={divStyle}
          onClick={() => this.props.moveFilterBoxToTop(this.props.name)}
        >
          <a onClick={() => this.setState({open: false})} className="pvtCloseX">
            ×
          </a>
          <span className="pvtDragHandle">☰</span>
          <h4>{this.props.name}</h4>

          {showMenu || <p>(too many values to show)</p>}

          {showMenu && (
            <p>
              <input
                type="text"
                placeholder="Filter values"
                className="pvtSearch"
                value={this.state.filterText}
                onChange={e =>
                  this.setState({
                    filterText: e.target.value,
                  })
                }
              />
              <br />
              <a
                role="button"
                className="pvtButton"
                onClick={() =>
                  this.props.removeValuesFromFilter(
                    this.props.name,
                    Object.keys(this.props.attrValues).filter(
                      this.matchesFilter.bind(this)
                    )
                  )
                }
              >
                Select {values.length === shown.length ? 'All' : shown.length}
              </a>{' '}
              <a
                role="button"
                className="pvtButton"
                onClick={() =>
                  this.props.addValuesToFilter(
                    this.props.name,
                    Object.keys(this.props.attrValues).filter(
                      this.matchesFilter.bind(this)
                    )
                  )
                }
              >
                Deselect {values.length === shown.length ? 'All' : shown.length}
              </a>
            </p>
          )}


          {showMenu && (
            <div className="pvtCheckContainer">
              {shown.map(x => (
                <p
                  key={x}
                  onClick={() => this.toggleValue(x)}
                  className={x in this.props.valueFilter ? '' : 'selected'}
                >
                  <a className="pvtOnly" onClick={e => this.selectOnly(e, x)}>
                    only
                  </a>
                  <a className="pvtOnlySpacer">&nbsp;</a>

                  {x === '' ? <em>null</em> : x}
                </p>
              ))}
            </div>
          )}
        </div>
      </Draggable>
    );
  }

  toggleFilterBox() {
    this.setState({open: !this.state.open});
    this.props.moveFilterBoxToTop(this.props.name);
  
  }

  toggleHoverLabel(status){
    this.setState({hover: status})
  }

  handleMouseOver(){
    const DELAY_SECONDS = 1000;
    this.handle = setTimeout(() => {
      this.setState({hover: true});
  }, DELAY_SECONDS )
  }

  handleMouseLeave(){
    this.setState({hover: false});
    if (this.handle) {
      clearTimeout(this.handle);
      this.handle = null;
  }
}


  render() {
    const filtered =
      Object.keys(this.props.valueFilter).length !== 0
        ? 'pvtFilteredAttribute'
        : '';

    const tooLtipStyles = {display: this.state.hover ? 'block': 'none',
    visibility: this.state.hover ? 'visible': 'hidden'
  };

  const attrSpanStyle =  this.props.attrToGroupColor &&  this.props.attrToGroupColor[this.props.name]?{
    backgroundColor: this.props.attrToGroupColor[this.props.name]
  }: {};

    return (
      !this.props.searchDropDown ? ( <li data-id={this.props.name}
        onMouseOver={this.handleMouseOver.bind(this)}
        onMouseLeave={this.handleMouseLeave.bind(this)}
        onMouseOut = {this.handleMouseLeave.bind(this)}
        onMouseDown = {()=>{this.setState({hover: false})}}
        onMouseUp={()=>{this.setState({hover: false})}}
      >
        <span className={'pvtAttr tooltip ' + filtered} style={attrSpanStyle}>
          {this.props.name}
          <span
            className="pvtTriangle"
            onClick={this.toggleFilterBox.bind(this)}
          >
            {' '}
            ▾
          </span>
          {
            this.props.label && this.props.label !== ""?
            <span className= "tooltiptext" style = {tooLtipStyles}>{this.props.label}</span>:""
          }
        </span>

      

        {this.state.open ? this.getFilterBox() : null}
        </li>) : (<div style={{position: "relative"}}>
                  <span style={{float: "right"}} onClick={this.toggleFilterBox.bind(this)}>
                              <SearchButton/>
                    </span>
                  {this.state.open ? this.getFilterBox() : null}
         
          
          
      </div>)
    );
  }
}

DraggableAttribute.defaultProps = {
  valueFilter: {},
};

DraggableAttribute.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  addValuesToFilter: PropTypes.func.isRequired,
  removeValuesFromFilter: PropTypes.func.isRequired,
  attrValues: PropTypes.objectOf(PropTypes.number).isRequired,
  valueFilter: PropTypes.objectOf(PropTypes.bool),
  moveFilterBoxToTop: PropTypes.func.isRequired,
  sorter: PropTypes.func.isRequired,
  menuLimit: PropTypes.number,
  zIndex: PropTypes.number,
};

class SearchButton extends React.PureComponent{
  render(){
    const size = this.props.size || "30px"
    return(<svg width={size} height={size} viewBox="0 0 16 16" className="bi bi-search" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10.442 10.442a1 1 0 0 1 1.415 0l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1 0-1.415z"/>
    <path fillRule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11zM13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"/>
  </svg>)
  }
}
export class Dropdown extends React.PureComponent {
  render() {
    return (
      <div className="pvtDropdown" style={{zIndex: this.props.zIndex}}>
        <div
          onClick={e => {
            e.stopPropagation();
            this.props.toggle();
          }}
          className={
            'pvtDropdownValue pvtDropdownCurrent ' +
            (this.props.open ? 'pvtDropdownCurrentOpen' : '')
          }
          role="button"
        >
          <div className="pvtDropdownIcon">{this.props.open ? '×' : '▾'}</div>
          {this.props.current || <span>&nbsp;</span>}
        </div>

        {this.props.open && (
          <div className="pvtDropdownMenu">
            {this.props.values.map(r => (
              <div
                key={r}
                role="button"
                onClick={e => {
                  e.stopPropagation();
                  if (this.props.current === r) {
                    this.props.toggle();
                  } else {
                    this.props.setValue(r);
                  }
                }}
                className={
                  'pvtDropdownValue ' +
                  (r === this.props.current ? 'pvtDropdownActiveValue' : '')
                }
              >
                {r}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export class CategoryCard extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      open: this.props.defaultOpen,
	  // Bump up to 500 AGB
      showAttrNums: this.props.showAttrNums || 500,
      showMenu: false,
      mouseOver: false,
      selectCategory: {},
      selectName: this.props.attrDict.name,
      selectAttributes: this.props.attrDict.attributes,
      selectDict: this.props.attrDict,
      // allSubAttributes: getAllAttributes(this.props.attrDict)
    };
   
  }

  handleSelectCategory(name, level){
   const updateSelect = Object.assign({}, this.state.selectCategory);
   updateSelect[level] = name;
   this.setState({
     selectCategory: updateSelect
   });
  }

 
 

  makeCateogryDnDCell(attrDict, level){
    const findAttr = (x) => (this.props.allAttributes.findIndex(y=>y.toLowerCase() === x.toLowerCase()) !==-1);
    // const name = attrDict.name;
    // const key = `${level}-${attrDict.name}`;
    // const curAttributes = level === this.props.categoryLevel ? this.getAllAttributes(attrDict) : attrDict.attributes;

    const key = attrDict.name; // assume no duplicate;
    const curAttributes = attrDict.attributes;
    const new_attrs = curAttributes && curAttributes.length > 0 ?
                      curAttributes.filter(findAttr).sort(sortAs(this.props.attrOrder || naturalSort)).slice(0, this.state.showAttrNums)
                      : [];

    // const onChangeAttr = (key) => (
    //   order => {
    //     const newOrders = Object.assign({}, this.state.attrOrder);
    //     newOrders[key] = order
    //     this.setState({attrOrder: newOrders})
    //   }
    //   );
    // const leastLength = this.props.attrOrder ? this.props.attrOrder.legn
    const onChangeAttr = (key) => (
      order=>{
        // console.log(key, order);
        if(order && order.length >= new_attrs.length){
          this.props.setUnusedAttrOrder(key, order);
        }
      }
    )

      const style = this.state.open ? {"width": "100%", "padding": "10px"}: {"width": "100%"};
        return (<Sortable
                  key = {key}
                  options={{
                    group: 'shared',
                    ghostClass: 'pvtPlaceholder',
                    filter: '.pvtFilterBox',
                    preventOnFilter: false,
                  }}
                tag="div"
                // className={classes}
                style={style}
                
                onChange={onChangeAttr(key)}
                >
                  {/* {name ?  <h4>{name}</h4>: <span></span>} */}
                  {new_attrs && new_attrs.length > 0 && this.state.open? new_attrs.map(x => (
                            <DraggableAttribute
                      
                              name={x}
                              label = {this.props.attrLabel[x] || ""} // for tests
                              key = {x}
                              attrValues={this.props.attrValues[x]}
                              valueFilter={this.props.valueFilter[x] || {}}
                              sorter={getSort(this.props.sorters, x)}
                              menuLimit={this.props.menuLimit}
                              setValuesInFilter={this.props.setValuesInFilter.bind(this)}
                              addValuesToFilter={this.props.addValuesToFilter.bind(this)}
                              moveFilterBoxToTop={this.props.moveFilterBoxToTop.bind(this)}
                              removeValuesFromFilter={this.props.removeValuesFromFilter.bind(this)}
                              zIndex={this.props.zIndices[x] || this.props.maxZIndex}
                              rowHeight = {this.props.rowHeight}
                              attrToGroupColor = {this.props.attrToGroupColor}
                            />
                          )):(
                          this.state.open?<span>No Attributes Here.</span>:
                          <div className="pvtPlaceholder pvtCategoryAttrHolder"></div>
                        )}
            </Sortable>)
    
  }

  getMenuItems(attrList, level){
    
    // consider to add a show all items
    const subMenuItems =  attrList.map(attrDict=>{
      const key = `${level}-${attrDict.name}`;
      const subMenu = attrDict.subcategory && attrDict.subcategory.length > 0 && this.state.selectCategory[level] === attrDict.name?
      this.getMenuItems(attrDict.subcategory, level + 1): "";
      
      return (
        <li 
        key = {key}
        className="nav-item dropdown">
          <a className="dropdown-item" 
            onMouseEnter={()=>this.handleSelectCategory(attrDict.name, level)}
            onClick = {()=>{
              const selectAttributes = this.state.showAll ? (attrDict.name === this.props.attrDict.name? getAllAttributes(this.props.attrDict): getAllAttributes(attrDict))
              : attrDict.attributes;
              this.setState({
              open: true,
              showMenu: false,
              selectName: attrDict.name,
              selectDict: attrDict,
              selectAttributes: selectAttributes,
            })}}
          >
        {attrDict.name}
        {attrDict.subcategory && attrDict.subcategory.length > 0? <span className="caret"></span>:""}
      </a>

      {subMenu}
      </li>
      )
    })

    const dropdownClass = level === 1? "dropdown-menu" : "dropdown-submenu"
    const style = this.state.showMenu? {display: "block"} : {display:"none"};
    return (<ul
      className={dropdownClass}
      style = {style}
      key = {`${level}`}
      >
        { subMenuItems}
    </ul>)
  }

  toggleShowAll(){
    const nextShowState = !this.state.showAll;
    const attrDict = this.state.selectDict;
    const selectAttributes = nextShowState ? 
    (attrDict.name === this.props.attrDict.name? getAllAttributes(this.props.attrDict): getAllAttributes(attrDict))
    : attrDict.attributes;
    this.setState({
      open: true,
      showMenu: false,
      showAll: nextShowState,
      // selectName: attrDict.name,
      selectAttributes: selectAttributes 
    })
  }

 
  // get the drop down for the current attributes
  renderMenu(attrDict){
    let attrList = [];
    if(attrDict.subcategory && attrDict.subcategory.length > 0){
      attrList = attrDict.subcategory.slice(0);
      // const parentAttrDict = Object.assign({}, attrDict)
      if(attrDict.attributes && attrDict.attributes.length > 0) {
        attrList.splice(0, 0, {name: attrDict.name, attributes: attrDict.attributes});
      }
    } 


    return(<div className="dropdown dropleft"
               style={{float: "right",
               }}>
           
             {
               attrDict.subcategory && attrDict.subcategory.length > 0 ? (<span>
                   <button className = "btn dropdown-toggle" type = "button"
                 onClick = {()=>this.setState({showMenu: !this.state.showMenu})}
             >
               {this.state.selectName}
             </button>
             <button 
               className="btn dropdown-toggle" 
               onClick={()=>{this.toggleShowAll()}}
             >{this.state.showAll? "hide subcategory":"show all"}</button>
             {this.getMenuItems(attrList, 1)}
               </span>): ""
             }

            <input className= 'attr-num-input' type='number' min = {0} defaultValue={500} onChange = {(e)=>{this.setState({showAttrNums: e.target.value})}} />
     </div>)
  }

  getAllAttributes(attrDict){
    const origAttributes = attrDict.attributes || [];
    const attributes = origAttributes.slice(0);
    if (attrDict.subcategory){
        attrDict.subcategory.forEach(subAttrDict=>{
        attributes.push.apply(attributes, this.getAllAttributes(subAttrDict))
      })
    }
    return attributes;
  }


  // udpate search function for 
  componentWillReceiveProps(nextProps) {

    const curAttrs = getAllAttributes(this.props.attrDict).filter((x) => (this.props.allAttributes.findIndex(y=>y.toLowerCase() === x.toLowerCase()) !==-1));
    const nextAttrs = getAllAttributes(nextProps.attrDict).filter((x) => (nextProps.allAttributes.findIndex(y=>y.toLowerCase() === x.toLowerCase()) !==-1));
    if (nextProps.attrDict.attributes 
       && this.props.attrDict.attributes 
       && nextProps.attrDict.attributes.length !== this.props.attrDict.attributes.length
       ) {
        this.setState({
          selectName: nextProps.attrDict.name,
          selectAttributes: nextProps.attrDict.attributes,
          open: true,
          showMenu: false
        });
    } else if (curAttrs.length !== nextAttrs.length &&  this.props.allAttributes.length !== 0) {
      this.setState({open: curAttrs.length !== nextAttrs.length && this.props.allAttributes.length !== 0});
    } else if ( this.props.allAttributes.length === 0){
      this.setState({open: this.props.defaultOpen});
    }
  }

  render(){
    return(  <div className = "pvtCateogryCard" 
                 key={this.props.attrDict.name}
             >
            <div className = "card-header">
              <div 
                onClick={()=>{this.setState({open: !this.state.open, showMenu: false})}}
                className= "card-title" 
                style = {{display: "inline-block", minWidth:"40%"}}
              >
              {this.props.attrDict.name} 
              </div>
              {this.renderMenu(this.props.attrDict)}
              {/* {this.props.attrDict.subcategory? <button>showAll</button>: ""} */}
            </div>
        
            <div className="card-body">
        {this.makeCateogryDnDCell({
          name: this.state.selectName,
          attributes: this.state.selectAttributes,
        }, 1)}

      </div>

      </div>)
  }

}


class PivotTableUI extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // unusedAttrOrder: this.props.attrOrder,
      unusedAttrOrder: {},
      classifiedUnusedOrder: {},
      zIndices: {},
      maxZIndex: 1000,
      openDropdown: false,
      attrValues: {},
      materializedInput: [],
      showConfig: false,
    };
    this.unusedRowRef = React.createRef();
  }

  componentDidMount() {
    this.materializeInput(this.props.data);
  }

  componentDidUpdate() {
   
    this.materializeInput(this.props.data);
  }

  materializeInput(nextData) {
    if (this.state.data === nextData) {
      return;
    }
    const newState = {
      data: nextData,
      attrValues: {},
      materializedInput: [],
    };
    let recordsProcessed = 0;
    PivotData.forEachRecord(
      newState.data,
      this.props.derivedAttributes,
      function(record) {
        newState.materializedInput.push(record);
        for (const attr of Object.keys(record)) {
          if (!(attr in newState.attrValues)) {
            newState.attrValues[attr] = {};
            if (recordsProcessed > 0) {
              newState.attrValues[attr].null = recordsProcessed;
            }
          }
        }
        for (const attr in newState.attrValues) {
          const value = attr in record ? record[attr] : 'null';
          if (!(value in newState.attrValues[attr])) {
            newState.attrValues[attr][value] = 0;
          }
          newState.attrValues[attr][value]++;
        }
        recordsProcessed++;
      }
    );
    this.setState(newState);
  }

  sendPropUpdate(command) {
    this.props.onChange(update(this.props, command));
  }

  propUpdater(key) {
   
    return value => {
      // console.log('propUpdater', key, value);
      this.sendPropUpdate({[key]: {$set: value}});
    }
  }

  setUnusedAttrOrder(key, order){
    // console.log(key, order);

    const newAttrOrder = Object.assign({}, this.state.unusedAttrOrder);
    const newOrder = order.slice(0) || [];
    const origOrder = newAttrOrder[key] || [];

    const notInNewOrder = origOrder.filter(item=>order.findIndex(newItem=>String(newItem).toLowerCase() === String(item).toLowerCase()) === -1)
    // const newOrder = order.push.apply(order, notInNewOrder);
    // console.log(newOrder, notInNewOrder);
    newOrder.push.apply(newOrder, notInNewOrder);
    newAttrOrder[key] = newOrder;
    this.setState({unusedAttrOrder: newAttrOrder});
  }

  setGroupValue(group, valueObject, origGroup){
    const nums = this.props.attrGroups? Object.keys(this.props.attrGroups).length : 0;
    if(!group || group === ""){
      group = `group-${nums + 1}`;
      
    }
    // add a color to new group
    const newAttrGroupColors = Object.assign({}, this.props.attrGroupsColor);
    const origColor = (origGroup && origGroup !=="") ? newAttrGroupColors[origGroup] : undefined;
    if (origColor && origColor !== undefined){
      delete newAttrGroupColors[origGroup];
    }
    if(!this.props.attrGroups[group] || (!newAttrGroupColors[group])){
      newAttrGroupColors[group] = origColor && origColor !== undefined? origColor: colors[nums % colors.length];
    }
    const curColor =  newAttrGroupColors[group];
    const newAttrToGroupColor = Object.assign({}, this.props.attrToGroupColor);
    for (const [key, value] of Object.entries(valueObject)){
      newAttrToGroupColor[key] = curColor;
    }

    if(origGroup && origGroup !== "" 
      && this.props.attrGroups 
      && origGroup in this.props.attrGroups 
      && origGroup !== group){
      const newAttrGroups = Object.assign({}, this.props.attrGroups);
      delete newAttrGroups[origGroup];
      if(Object.keys(valueObject).length > 0){
        newAttrGroups[group] = valueObject;
      }
      this.sendPropUpdate({
        attrGroups:{
          $set: newAttrGroups
        },
        attrToGroupColor:{
          $set: newAttrToGroupColor
        },
        attrGroupsColor: {
          $set:  newAttrGroupColors
        }
        // attrToGroups:
      });
    } else {
      this.sendPropUpdate({
        attrGroups:{
          [group]:{
            $set: valueObject
          }
        },
        attrToGroupColor:{
          $set: newAttrToGroupColor
        },
        attrGroupsColor: {
          $set:  newAttrGroupColors
        }
      });
    }
  }

  setValuesInFilter(attribute, values) {
    this.sendPropUpdate({
      valueFilter: {
        [attribute]: {
          $set: values.reduce((r, v) => {
            r[v] = true;
            return r;
          }, {}),
        },
      },
    });
  }


  addValuesToFilter(attribute, values) {
    if (attribute in this.props.valueFilter) {
      this.sendPropUpdate({
        valueFilter: {
          [attribute]: values.reduce((r, v) => {
            r[v] = {$set: true};
            return r;
          }, {}),
        },
      });
    } else {
      this.setValuesInFilter(attribute, values);
    }
  }

  removeValuesFromFilter(attribute, values) {
    this.sendPropUpdate({
      valueFilter: {[attribute]: {$unset: values}},
    });
    // console.log(this.props.valueFilter)
  }

  moveFilterBoxToTop(attribute) {
    this.setState(
      update(this.state, {
        maxZIndex: {$set: this.state.maxZIndex + 1},
        zIndices: {[attribute]: {$set: this.state.maxZIndex + 1}},
      })
    );
  }

  isOpen(dropdown) {
    return this.state.openDropdown === dropdown;
  }
  
  closeConfigModal(){
    this.setState({showConfig: false});
  }

  showConfigModal(){
    this.setState({showConfig: true});
  }

  makeClassifiedDnDCell(items, classes) {


    const filterAttrs = Object.keys(this.props.valueFilter[this.props.searchName] || {});
    const remainAttributes = filterAttrs.length === 0? 
    items: items.filter(x=>filterAttrs.findIndex(y=>y.toLowerCase()===x.toLowerCase()) === -1);
    const attrList = filterAttrs.length === 0 ? this.props.attrCategory : [
     {
       name: "Filter Attributes",
       attributes: remainAttributes
     }
    ]

    const rowHeight = this.unusedRowRef.current ? this.unusedRowRef.current.clientHeight : 0;
    const classfiedAttrs = attrList.reduce((prev, cur)=>{
          prev.push.apply(prev, getAllAttributes(cur))
          return prev;
    },[]);
      const findUnclassfiedAttr = (x) => (classfiedAttrs.findIndex(y=>y.toLowerCase() === x.toLowerCase()) ===-1);
      const unclassfiedAttrs = remainAttributes.filter(findUnclassfiedAttr);
      // const newAttrList = attrList.slice(0);
      if (unclassfiedAttrs.length > 0){
        attrList.push({
          name: this.props.unclassifiedAttrName,
          attributes: unclassfiedAttrs
        })
      }

return (<td className={classes + " pvtCategoryArea"}>
  <div className="pvtCategoryContainer">
  {
    attrList.map((attrDict, i)=>{

      return(<CategoryCard
        key = {attrDict.name}
        attrDict = {attrDict}
        classes = {classes}
        allAttributes = {remainAttributes}
        defaultOpen = {i === 0}
        attrLabel = {this.props.attrLabel}
        // unclassifiedAttrName = {this.props.unclassifiedAttrName}
        // categoryLevel = {1}
        attrOrder = {this.state.unusedAttrOrder[attrDict.name] || this.props.attrOrder || []}
        attrValues={this.state.attrValues}
        rowHeight = {rowHeight}
        valueFilter={this.props.valueFilter || {}}
        sorter={this.props.sorters}
        menuLimit={this.props.menuLimit}
        setValuesInFilter={this.setValuesInFilter.bind(this)}
        setUnusedAttrOrder = {this.setUnusedAttrOrder.bind(this)}
        addValuesToFilter={this.addValuesToFilter.bind(this)}
        moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
        removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
        zIndices = {this.state.zIndices}
        maxZIndex = {this.state.maxZIndex} 
        attrToGroupColor = {this.props.attrToGroupColor}
    />
      )
    })
  }
  </div>
</td>
  
)
}

  makeDnDCell(items, onChange, classes) {
    const filterAttrs = Object.keys(this.props.valueFilter["Select Attributes"] || {});
    const remainAttributes = filterAttrs.length === 0? 
    items: items.filter(x=>filterAttrs.findIndex(y=>y.toLowerCase()===x.toLowerCase()) === -1);
    return (
      <Sortable
        options={{
          group: 'shared',
          ghostClass: 'pvtPlaceholder',
          filter: '.pvtFilterBox',
          preventOnFilter: false,
        }}
        tag="td"
        className={classes}
        onChange={onChange}
      >
        {remainAttributes.map(x => (
          <DraggableAttribute
            name={x}
            label = {this.props.attrLabel[x] || ""} // for tests
            key={x}
            attrValues={this.state.attrValues[x]}
            valueFilter={this.props.valueFilter[x] || {}}
            sorter={getSort(this.props.sorters, x)}
            menuLimit={this.props.menuLimit}
            setValuesInFilter={this.setValuesInFilter.bind(this)}
            addValuesToFilter={this.addValuesToFilter.bind(this)}
            moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
            removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
            zIndex={this.state.zIndices[x] || this.state.maxZIndex}
            attrToGroupColor = {this.props.attrToGroupColor}
          />
        ))}
      </Sortable>
    );
  }


  render() {
    const numValsAllowed =
      this.props.aggregators[this.props.aggregatorName]([])().numInputs || 0;

    const rendererName =
      this.props.rendererName in this.props.renderers
        ? this.props.rendererName
        : Object.keys(this.props.renderers)[0];
    

    // const curCategoryLevel = this.props.categoryLevel? this.props.categoryLevel: this.props.maxCategoryLevel;
  
    const sortIcons = {
      key_a_to_z: {
        rowSymbol: '↕',
        colSymbol: '↔',
        next: 'value_a_to_z',
      },
      value_a_to_z: {
        rowSymbol: '↓',
        colSymbol: '→',
        next: 'value_z_to_a',
      },
      value_z_to_a: {rowSymbol: '↑', colSymbol: '←', next: 'key_a_to_z'},
    };

    const aggregatorCell = (
      <td className="pvtVals">
        <Dropdown
          current={this.props.aggregatorName}
          values={Object.keys(this.props.aggregators)}
          open={this.isOpen('aggregators')}
          zIndex={this.isOpen('aggregators') ? this.state.maxZIndex + 1 : 1}
          toggle={() =>
            this.setState({
              openDropdown: this.isOpen('aggregators') ? false : 'aggregators',
            })
          }
          setValue={this.propUpdater('aggregatorName')}
        />
        <a
          role="button"
          className="pvtRowOrder"
          onClick={() =>
            this.propUpdater('rowOrder')(sortIcons[this.props.rowOrder].next)
          }
        >
          {sortIcons[this.props.rowOrder].rowSymbol}
        </a>
        <a
          role="button"
          className="pvtColOrder"
          onClick={() =>
            this.propUpdater('colOrder')(sortIcons[this.props.colOrder].next)
          }
        >
          {sortIcons[this.props.colOrder].colSymbol}
        </a>
        {numValsAllowed > 0 && <br />}
        {new Array(numValsAllowed).fill().map((n, i) => [
          <Dropdown
            key={i}
            current={this.props.vals[i]}
            values={Object.keys(this.state.attrValues).filter(
              e =>
                !this.props.hiddenAttributes.includes(e) &&
                !this.props.hiddenFromAggregators.includes(e)
            )}
            open={this.isOpen(`val${i}`)}
            zIndex={this.isOpen(`val${i}`) ? this.state.maxZIndex + 1 : 1}
            toggle={() =>
              this.setState({
                openDropdown: this.isOpen(`val${i}`) ? false : `val${i}`,
              })
            }
            setValue={value =>
              this.sendPropUpdate({
                vals: {$splice: [[i, 1, value]]},
              })
            }
          />,
          i + 1 !== numValsAllowed ? <br key={`br${i}`} /> : null,
        ])}
      </td>
    );

    const unusedAttrs = Object.keys(this.state.attrValues)
      .filter(
        e =>
          !this.props.rows.includes(e) &&
          !this.props.cols.includes(e) &&
          !this.props.hiddenAttributes.includes(e) &&
          !this.props.hiddenFromDragDrop.includes(e)
      )
      .sort(sortAs(this.state.unusedOrder));

    const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
    const horizUnused = unusedLength < this.props.unusedOrientationCutoff;
	
	// Added pvtScroll by SAS2412 
	// var unusedAttrsCell = this.makeDnDCell(unusedAttrs, function (order) {
	// 	return _this8.setState({ unusedOrder: order });
	// }, 'pvtAxisContainer pvtUnused pvtScroll ' + (horizUnused ? 'pvtHorizList' : 'pvtVertList'));
	  
    const unusedAttrsCell = this.props.attrClassified? 
    this.makeClassifiedDnDCell(unusedAttrs,
      `pvtAxisContainer pvtUnused ${
        horizUnused ? 'pvtHorizList' : 'pvtVertList'
      }`):
    this.makeDnDCell(
      unusedAttrs,
      order => this.setState({unusedOrder: order}),
      `pvtAxisContainer pvtUnused ${
        horizUnused ? 'pvtHorizList' : 'pvtVertList'
      }`
    );

    const unusedAttrsDict = unusedAttrs.reduce((prev, attr)=>{
      prev[attr] = 1
      return prev
    }, {})
    const searchName = "Select Attributes";
    const searchAttrs = (<DraggableAttribute
       searchDropDown = {true}
       name = {searchName}
       attrValues = {unusedAttrsDict}
       valueFilter= {this.props.valueFilter[searchName] || {}}
       sorter={getSort(this.props.sorters, searchName)}
       menuLimit = {this.props.menuLimit}
       setValuesInFilter={this.setValuesInFilter.bind(this)}
       addValuesToFilter={this.addValuesToFilter.bind(this)}
       moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
       removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
       zIndex={this.state.zIndices[searchName] || this.state.maxZIndex}
           
      />)
    
    const searchCells = (
      <tr>
        <td >
              </td>
              <td className="pull-right" style={{padding: "5px"}}>
              {searchAttrs}
              </td>
      </tr>
    )

    const resetButton = (
      <button 
      className ="btn btn-custom-primary"
      onClick={()=>{
        const curValueFilter  = this.props.valueFilter || {};
        const searchName = this.props.searchName;
        const searchFilter = {[searchName]: curValueFilter[searchName] || {}};
        this.sendPropUpdate({
          valueFilter: {
            $set: searchFilter,    
          },
        });
        // this.sendPropUpdate({valueFilter: {$set: {}}});
      }}>Reset Filters</button>
    )

    // const configButton = ( <button 
    //   className ="btn btn-custom-primary"
    //   onClick={this.showConfigModal.bind(this)}
    //   >
    //     Show Config
    //   </button>)

    const rendererCell = (
      <td className="pvtRenderers">
        <Dropdown
          current={rendererName}
          values={Object.keys(this.props.renderers)}
          open={this.isOpen('renderer')}
          zIndex={this.isOpen('renderer') ? this.state.maxZIndex + 1 : 1}
          toggle={() =>
            this.setState({
              openDropdown: this.isOpen('renderer') ? false : 'renderer',
            })
          }
          setValue={this.propUpdater('rendererName')}
        />
       <div className="pvtDropdown">
       <div className="pvtButtonContainer">
        {resetButton}
       </div>
       {/* <div className="pvtButtonContainer">
        {configButton}
       </div> */}
       </div>
      </td>
    );


    const colAttrs = this.props.cols.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );

    const colAttrsCell = this.makeDnDCell(
      colAttrs,
      this.propUpdater('cols'),
      'pvtAxisContainer pvtHorizList pvtCols'
    );

    const rowAttrs = this.props.rows.filter(
      e =>
        !this.props.hiddenAttributes.includes(e) &&
        !this.props.hiddenFromDragDrop.includes(e)
    );
    const rowAttrsCell = this.makeDnDCell(
      rowAttrs,
      this.propUpdater('rows'),
      'pvtAxisContainer pvtVertList pvtRows'
    );
    const outputCell = (
      <td className="pvtOutput">
        <PivotTable
          {...update(this.props, {
            data: {$set: this.state.materializedInput},
          })}
        />
      </td>
    );

    // console.log('test attrGroups', this.props.attrGroups);
    const TableConfigModal = (
      <ConfigModal
        show = {this.state.showConfig}
        handleOpen = {this.showConfigModal.bind(this)}
        handleClose = {this.closeConfigModal.bind(this)} 
        zIndex={this.state.maxZIndex + 1}
        groups = {this.props.attrGroups}
        attrToGroupColor = {this.props.attrToGroupColor}
        setGroupValue = {this.setGroupValue.bind(this)}
        values = {Object.keys(this.state.attrValues)
        .filter(
          e =>
            !this.props.hiddenAttributes.includes(e) &&
            !this.props.hiddenFromDragDrop.includes(e)
        )}
      />
    )

    if (horizUnused) {
      return (
        <div>
       
          <table className="pvtUi">
          <tbody onClick={() => this.setState({openDropdown: false})}>
             {searchCells} 
             <tr>
               <td></td>
               <td className="pvtAxisContainer pvtCategoryArea">
                 {TableConfigModal}
             </td>
             </tr>
            <tr ref = {this.unusedRowRef}>
              {rendererCell}
              {unusedAttrsCell}
            </tr>
            <tr>
              {aggregatorCell}
              {colAttrsCell}
            </tr>
            <tr>
              {rowAttrsCell}
              {outputCell}
            </tr>
          </tbody>
        </table>
         
          </div>
      );
        
    }

    return (
     <div>
           {TableConfigModal}
        <table className="pvtUi">
        <tbody onClick={() => this.setState({openDropdown: false})}>
          <tr>
            {rendererCell}
            {aggregatorCell}
            {colAttrsCell}
          </tr>
          <tr>
            {unusedAttrsCell}
            {rowAttrsCell}
            {outputCell}
          </tr>
        </tbody>
      </table>
  
     </div>
    );
  }
}

PivotTableUI.propTypes = Object.assign({}, PivotTable.propTypes, {
  onChange: PropTypes.func.isRequired,
  hiddenAttributes: PropTypes.arrayOf(PropTypes.string),
  hiddenFromAggregators: PropTypes.arrayOf(PropTypes.string),
  hiddenFromDragDrop: PropTypes.arrayOf(PropTypes.string),
  unusedOrientationCutoff: PropTypes.number,
  menuLimit: PropTypes.number,
  maxCategoryLevel: PropTypes.number,
  categoryLevel: PropTypes.number,

});

PivotTableUI.defaultProps = Object.assign({}, PivotTable.defaultProps, {
  hiddenAttributes: [],
  hiddenFromAggregators: [],
  hiddenFromDragDrop: [],
  unusedOrientationCutoff: 85,
  menuLimit: 500,  
  maxCategoryLevel: 3,
  categoryLevel: 2,

});

export default PivotTableUI;
