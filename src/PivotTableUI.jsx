import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {PivotData, sortAs, getSort, subCategoryRange} from './Utilities';
import PivotTable from './PivotTable';
import Sortable from 'react-sortablejs';
import Draggable from 'react-draggable';

/* eslint-disable react/prop-types */
// eslint can't see inherited propTypes!

export class DraggableAttribute extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false, filterText: '', curHeight: 0};
  }

  toggleValue(value) {
    if (value in this.props.valueFilter) {
      this.props.removeValuesFromFilter(this.props.name, [value]);
    } else {
      this.props.addValuesToFilter(this.props.name, [value]);
    }
  }

  matchesFilter(x) {
    return x
      .toLowerCase()
      .trim()
      .includes(this.state.filterText.toLowerCase().trim());
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

    return (
      <Draggable handle=".pvtDragHandle">
        <div
          className="pvtFilterBox"
          style={{
            display: 'block',
            cursor: 'initial',
            zIndex: this.props.zIndex,
            // top: this.state.curHeight,
          }}
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

  render() {
    const filtered =
      Object.keys(this.props.valueFilter).length !== 0
        ? 'pvtFilteredAttribute'
        : '';
    return (
      <li data-id={this.props.name}
        ref={el => {
          if(!el){
            return
          }
          const curHeight = el.getBoundingClientRect().bottom + 600;
          if (curHeight !== this.state.curHeight){
            this.setState({curHeight: curHeight});
          }
      }}
      
      >
        <span className={'pvtAttr ' + filtered}>
          {this.props.name}
          <span
            className="pvtTriangle"
            onClick={this.toggleFilterBox.bind(this)}
          >
            {' '}
            ▾
          </span>
        </span>

        {this.state.open ? this.getFilterBox() : null}
      </li>
    );
  }
}

DraggableAttribute.defaultProps = {
  valueFilter: {},
};

DraggableAttribute.propTypes = {
  name: PropTypes.string.isRequired,
  addValuesToFilter: PropTypes.func.isRequired,
  removeValuesFromFilter: PropTypes.func.isRequired,
  attrValues: PropTypes.objectOf(PropTypes.number).isRequired,
  valueFilter: PropTypes.objectOf(PropTypes.bool),
  moveFilterBoxToTop: PropTypes.func.isRequired,
  sorter: PropTypes.func.isRequired,
  menuLimit: PropTypes.number,
  zIndex: PropTypes.number,
};

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

export class AttributesArea extends React.Component {
  constructor(props) {
     super(props);
     this.state = {
       attrOrder: {},
     };
  }

  getAllAttributes(attrDict){
    const origAttributes = attrDict.attributes || [];
    let attributes = origAttributes.slice(0); // must be deep copy;
    if (attrDict.subcategory){
        attrDict.subcategory.forEach(subAttrDict=>{
        attributes.push.apply(attributes, this.getAllAttributes(subAttrDict))
      })
    }
    return attributes;
  }

  makeCateogryDnDCell(attrDict, showName, level, classes){
    const findAttr = (x) => (this.props.allAttributes.findIndex(y=>y.toLowerCase() === x.toLowerCase()) !==-1);
    const name = attrDict.name;
    const key = `${level}-${attrDict.name}`;
    const curAttributes = level === this.props.categoryLevel ? this.getAllAttributes(attrDict) : attrDict.attributes;
    const new_attrs = curAttributes && curAttributes.length > 0 ?
                      curAttributes.filter(findAttr).sort(sortAs(this.state.attrOrder[key] || this.props.attrOrder)) 
                      : [];
   
    const onChangeAttr = (key) => (
      order => {
        let newOrders = Object.assign({}, this.state.attrOrder);
        newOrders[key] = order
        this.setState({attrOrder: newOrders})
      }
      );
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
                
                onChange={onChangeAttr(key)}
                >
                  {name && showName?  <h4>{name}</h4>: <span></span>}
                  {new_attrs && new_attrs.length > 0 ? new_attrs.map(x => (
                            <DraggableAttribute
                              name={x}d
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
                            />
                          )):<span></span>}
            </Sortable>)
    
  }

  renderList(attrList, level) {
    return attrList.map(attrDict=>{
      const key = `${level}-${attrDict.name}`;
      if(attrDict.subcategory && level < this.props.categoryLevel){
     
        return (
                    <div key={key} className="pvtCategoryDiv">
                          {
                              attrDict.attributes && attrDict. attributes.length > 0 ?
                              this.makeCateogryDnDCell(attrDict, true, level,  "pvtParentAttrArea")
                              :
                              <h4>{attrDict.name}</h4>
                          }
                           {this.renderList(attrDict.subcategory, level + 1)}
                </div>
              )
      }
      return (
        <div key = {key} className="pvtCategoryDiv">
       { this.makeCateogryDnDCell(attrDict, true, level, this.props.classes + " pvtSubCategoryArea")}
      </div>
      )
    })
  }

  render() {
  
    // get unclassified Attrs
    const classfiedAttrs = this.props.attrList.reduce((prev, cur)=>{
          prev.push.apply(prev, this.getAllAttributes(cur))
          return prev;
    },[]);
    const findUnclassfiedAttr = (x) => (classfiedAttrs.findIndex(y=>y.toLowerCase() === x.toLowerCase()) ===-1);
    const unclassfiedAttrs = this.props.allAttributes.filter(findUnclassfiedAttr);
    let attrList = this.props.attrList;
    if (unclassfiedAttrs.length > 0){
      attrList.push({
        name: this.props.unclassifiedAttrName,
        attributes: unclassfiedAttrs
      })
    }

    return(    <td className={this.props.classes + " pvtCategoryArea"}>
             <div className="pvtAttrsContainer">
                {
                  this.renderList(attrList, 1)
                }
            </div>
        </td>
      )
  }

}


AttributesArea.propTypes = {
  attrList: PropTypes.array.isRequired,
  allAttributes: PropTypes.array.isRequired,
  classes: PropTypes.string,
  zIndices: PropTypes.object,
  maxZIndex: PropTypes.number,
};

class PivotTableUI extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      unusedOrder: this.props.attrOrder,
      classifiedUnusedOrder: {},
      zIndices: {},
      maxZIndex: 1000,
      openDropdown: false,
      attrValues: {},
      materializedInput: [],
    };
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
    return value => this.sendPropUpdate({[key]: {$set: value}});
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
    // console.log(this.props.valueFilter)
  }

  removeValuesFromFilter(attribute, values) {
    this.sendPropUpdate({
      valueFilter: {[attribute]: {$unset: values}},
    });
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
  


  makeClassifiedDnDCell(items, classes) {

    const filterAttrs = Object.keys(this.props.valueFilter["Select Attributes"] || {});
    const remainAttributes = filterAttrs.length === 0? 
    items: items.filter(x=>filterAttrs.findIndex(y=>y.toLowerCase()===x.toLowerCase()) === -1);
    const attrList = filterAttrs.length === 0 ? this.props.attrCategory : [
     {
       name: "Filter Attributes",
       attributes: remainAttributes
     }
    ]
    
      return ( <AttributesArea
        attrList = {attrList}
        classes = {classes}
        allAttributes = {remainAttributes}
        unclassifiedAttrName = {this.props.unclassifiedAttrName}
        categoryLevel = {this.props.categoryLevel || this.props.maxCategoryLevel}
        attrOrder = {this.props.attrOrder}
        attrValues={this.state.attrValues}
        valueFilter={this.props.valueFilter || {}}
        sorter={this.props.sorters}
        menuLimit={this.props.menuLimit}
        setValuesInFilter={this.setValuesInFilter.bind(this)}
        addValuesToFilter={this.addValuesToFilter.bind(this)}
        moveFilterBoxToTop={this.moveFilterBoxToTop.bind(this)}
        removeValuesFromFilter={this.removeValuesFromFilter.bind(this)}
        zIndices = {this.state.zIndices}
        maxZIndex = {this.state.maxZIndex} 
    />)
  
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
    

    const curCategoryLevel = this.props.categoryLevel? this.props.categoryLevel: this.props.maxCategoryLevel;
  
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
      {
        // category level setting
        this.props.attrClassified?
        (<div>
          
          <div className={"pvtTableOptionLabel"}> 
          Show category level
         </div>
          <Dropdown
            current={curCategoryLevel}
            values={subCategoryRange(this.props.maxCategoryLevel)}
            open={this.isOpen('categorySetter')}
            zIndex={this.isOpen('categorySetter') ? this.state.maxZIndex + 1 : 1}
            toggle={() =>
              this.setState({
                openDropdown: this.isOpen('categorySetter') ? false :'categorySetter',
              })
            }
            setValue={this.propUpdater('categoryLevel')}
          />
        </div>
        ):<div></div>
      }
       <div className="pvtDropdown">
       <div className="pvtDropdownCurrent">
        {
          searchAttrs
        }
       </div>
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

    if (horizUnused) {
      return (
        <table className="pvtUi">
          <tbody onClick={() => this.setState({openDropdown: false})}>
            <tr>
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
      );
    }

    return (
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
