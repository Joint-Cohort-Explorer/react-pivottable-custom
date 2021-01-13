import React from 'react';
import PropTypes from 'prop-types';
import Sortable from 'react-sortablejs';
import { HexColorPicker } from "react-colorful";
import "react-colorful/dist/index.css";
// import Draggable from 'react-draggable';
const colors = [
  "#ECF5FF",
  "#D2E9FF",
  "#C4E1FF",
  "#ACD6FF",
  "#97CBFF",
  "84C1FF",
  "ECFFFF",
]

function getUngroupedValues(allValues, groups){
  const groupedValues = [];
  for (const [key, values] of Object.entries(groups)){
    groupedValues.push.apply(groupedValues, Object.keys(values));
  }
  const ungroupedValues = allValues.filter(value=>groupedValues.findIndex(groupedValue=>String(value).toLowerCase() === String(groupedValue).toLowerCase()) === -1);
  return ungroupedValues;
}

export default class ConfigModal extends React.Component{
    constructor(props){
        super(props);
        // const ungroupedValues = getUngroupedValues(this.props.values.slice(0), this.props.groups);
        // console.log('in constructors', ungroupedValues)
        this.state = {
            open: false, 
            show: false,
            filterText: '', 
            selectGroup: '',
            alterGroupName: '', 
            attrColor: '',
            showColorPicker: false,
            selectValues: {},
            errors: {},
            ungroupedValues: [],
            showEditAttr: false,
        };
    }

    closeEditMode(){
        this.setState({open: false, selectGroup: "", alterGroupName: "", filterText:"", selectValues: {}});
    }

    matchesFilter(x) {
        return x
          .toLowerCase()
          .trim()
          .includes(this.state.filterText.toLowerCase().trim());
        // return equation && equation !== "" && !isNaN(x) ? equation: conditions.findIndex(cond=>String(x).toLowerCase().trim().includes(cond.trim())) !== -1;
      }

      toggleValue(value){
          const newValues = Object.assign({}, this.state.selectValues);
          if(value in newValues){
              delete newValues[value];
          }else{
              newValues[value] = true;
          }
          this.setState({selectValues: newValues})
      }

      saveGroup(){
          // console.log('in modal', this.state);
          const origName = this.state.selectGroup;
          const groupName = this.state.alterGroupName;
          const groupColor = this.state.groupColor;
          const newValues = Object.assign({}, this.state.selectValues);
        
          this.props.setGroupValue(groupName, newValues, origName, groupColor);
        //   this.setState({open: false, selectGroup: "", alterGroupName: "", selectValues: {}});
            this.closeEditMode();
      }



    getFilterBox() {

        const values = this.props.values.slice(0); 
        const shown = values
          .filter(x=>!this.props.attrToGroups[x] || this.props.attrToGroups[x] === this.state.selectGroup)
          .filter(this.matchesFilter.bind(this))
          .sort(this.props.sorter);
        
        //   console.log(shown);
         
       const divStyle = {
          display: 'block',
          cursor: 'initial',
          // right: '120px'
          // width: '100%'
          zIndex: this.props.zIndex || 1000,

        };

        return (

            <div className='config-card'>
             


                <div className = 'form-row'>
                 <span className = 'label'>Group Name </span>
                  <input
                        type="text"
                        style={{minWidth: "40%", height: "26px", border:"1px solid #a2b1c6"}}
                        placeholder="Group Name"
                        // className="pvtSearch"
                        value={this.state.alterGroupName}
                        onChange={e =>
                        this.setState({
                           alterGroupName: e.target.value,
                        })
                        }
                    />
                </div>

                     
              <div className="form-row"> 
                <span className='label'>Group Color  </span>
                <div
                  className="swatch"
                  style = {{backgroundColor: this.state.groupColor}}
                  onClick = {()=>this.setState({showColorPicker: !this.state.showColorPicker})}

                />
                {
                  this.state.showColorPicker && (<div> 
                    <HexColorPicker color={this.state.groupColor} onChange={color=>this.setState({groupColor: color})}/>
                  </div>)
                }
              
                        
              </div>

              <div className="Form-row">
                <span className="label">Group Attributes</span>
                <div className="modal-group-div">
                {this.makeDnDAttrs(this.state.alterGroupName, order=>this.setState({
                  selectValues: order.reduce((res, value)=>{
                    res[value] = true;
                    return res;
                  }, {})
                }), 
                Object.keys(this.state.selectValues),
                this.state.groupColor)
                }
                </div>
              </div>

              <div className="form-row"> 

              <span>
                <button  role="button"
                  className="pvtButton"
                  onClick = {()=>this.setState({showEditAttr: !this.state.showEditAttr})}  
                >Select Attributes
                
                <span
                className="pvtTriangle"
                // onClick={this.toggleFilterBox.bind(this)}
              >
                {' '}
                ▾
             </span>

                </button>

                <button role="button"
                    className="pvtButton"
                    onClick={()=>this.setState({open: false, selectGroup: "", alterGroupName: "", selectValues: {}})}
                    >
                      Cancel
                  </button>
                  <button role="button"
                    className="pvtButton"
                    onClick={()=>this.saveGroup()}
                >
                      Save
                  </button>

              </span>
              {this.state.showEditAttr &&  (
                <div style={divStyle} className="pvtFilterBox">
                     
                     <a onClick={() => this.setState({showEditAttr: false})} className="pvtCloseX">
                      ×
                    </a>
                  <h4> Ungrouped Attributes</h4>
                  <input
                    type="text"
                    style={{width: "80%", minHeight: "26px"}}
                    placeholder="Filter values"
                    // className="pvtSearch"
                    value={this.state.filterText}
                    onChange={e =>
                      this.setState({
                        filterText: e.target.value,
                      })
                    }
                  />
                  <br />
                  <button
                    role="button"
                    className="pvtButton"
                    onClick = {()=>{
                        const valueAsObject = {};
                        shown.forEach(value=>{
                            valueAsObject[value] = true;
                        })
                        this.setState({selectValues: valueAsObject});
                    }}
                  >
                    Select {values.length === shown.length ? 'All' : shown.length}
                  </button>{' '}
                  <button
                    role="button"
                    className="pvtButton"
                    onClick={()=>this.setState({selectValues: {}})}
                    // onClick={() =>
                    //   this.props.addValuesToFilter(
                    //     this.props.name,
                    //     Object.keys(this.props.attrValues).filter(
                    //       this.matchesFilter.bind(this)
                    //     )
                    //   )
                    // }
                  >
                    Deselect {values.length === shown.length ? 'All' : shown.length}
                  </button>




                  <div className="pvtCheckContainer">
                  {shown.map(x => (
                    <p
                      key={x}
                      onClick={() => this.toggleValue(x)}
                      className={!(x in this.state.selectValues) ? '' : 'selected'}
                    >
                      {/* <a className="pvtOnly" onClick={e => this.selectOnly(e, x)}>
                        only
                      </a> */}
                      <a className="pvtOnlySpacer">&nbsp;</a>
    
                      {x === '' ? <em>null</em> : x}
                    </p>
                  ))}
                </div>
                </div>
              )}
              </div>
    
    
          

            </div>
        );
      }
    

      // todo: add one click delete
    makeDnDAttrs(groupName, onChangeAttr, groupValues, groupColor){
      // console.log(this.props.attrGroupsColor);
      // const groupColor = this.props.attrGroupsColor ? this.props.attrGroupsColor[groupName]: undefined;

      const attrStyle = groupColor && groupColor !== undefined ? {backgroundColor: groupColor}: {};
        return(<Sortable
          key = {groupName}
          options={{
            group: 'group-attrs',
            ghostClass: 'pvtPlaceholder',
            filter: '.pvtFilterBox',
            preventOnFilter: false,
          }}
        tag="div"
        onChange={onChangeAttr}
        // onChange={onChangeAttr(key)}
        >
      {groupValues.map(value=>(<li 
        data-id = {value} 
        key={value} 
      >
    
        <span className="pvtAttr" style ={attrStyle}>
            {value} 
            {/* <span className="pvtTriangle"> {' '} &times;</span> */}
        </span>
        

      </li>))}
    </Sortable>)
    }
    
    renderGroupDetails(groupName, groupAttrObject){
        // const groupValues = Object.keys(groupAttrObject).reduce(res, item=>{
        //     if(groupAttrObject[item] === true){
        //         res.push(item);
        //     }
        //     return res;
        // }, []);

        const groupValues = Object.keys(groupAttrObject);
        
        const onChangeAttr = order => {
          const newValues = {};
          order.forEach(attr=>newValues[attr]= true);
          this.props.setGroupValue(groupName, newValues, "");
        }
        return(<div key= {groupName} className="modal-group-div">

            <div >
            <span style={{fontSize: "14px"}}>{groupName}</span>
              <button 
                  className="pvtButton"
                  style={{float: "right"}}
                  onClick={()=>{
                  this.setState({open: true, selectGroup: groupName, alterGroupName: groupName, selectValues: groupAttrObject, 
                    groupColor: this.props.attrGroupsColor[groupName],
                    showEditAttr: false,
                    showColorPicker: false
                  });
              }}>Edit Group </button>
            </div>
         
          

           {this.makeDnDAttrs(groupName, onChangeAttr, groupValues,  this.props.attrGroupsColor ? this.props.attrGroupsColor[groupName]: undefined)}
            {/* {groupValues.map(value=>(<span key={value} className="modal-attr-span">{value}</span>))} */}
           
        </div>)
    }


  
    componentWillReceiveProps(nextProps){
      const allValues =  nextProps.values.slice(0);
      const ungroupedValues = getUngroupedValues(allValues, nextProps.groups);
      this.setState({ungroupedValues: ungroupedValues});
      // if(this.props.groups !== nextProps.groups && this.props.values !== nextProps.values){
        
      //   const allValues =  nextProps.values.slice(0);
      //   const ungroupedValues = getUngroupedValues(allValues, nextProps.groups);
      //   this.setState({ungroupedValues: ungroupedValues});
      // }
    }

    renderGroups(){

        const onChangeUngrouped = order=>this.setState({ungroupedValues:order});
        const nums = this.props.groups ? Object.keys(this.props.groups).length : 0;
        return(<div>
            <div className="modal-group-div ungrouped-div">
             <span style={{fontSize: "14px"}}>Ungrouped Attributes</span>
              {this.makeDnDAttrs('Ungrouped Attrs', onChangeUngrouped, this.state.ungroupedValues)}
            </div>
           {
             this.props.groups && Object.keys(this.props.groups).length > 0 && ( <div className="ungrouped-div">
             {Object.keys(this.props.groups).map(group=>{
                 return this.renderGroupDetails(group, this.props.groups[group])
             })}
           </div>)
           }
            <button 
                 className="pvtButton"
                //  style={{float: "right"}}
                onClick={()=>{
                const groupNum = this.props.groups? Object.keys(this.props.groups).length : 0;
                const defaultName = `group-${groupNum + 1}`
                this.setState({open: true, 
                  selectGroup: "", alterGroupName: defaultName, selectValues:{}, 
              groupColor: colors[nums % colors.length],
              showEditAttr: false,
              showColorPicker: false
            })
            }}>Add New Group</button>
        </div>)
    }


    render(){
      // className="modal" style = {{zIndex: this.props.zIndex || 1000}}
        return (<div className="pvtCategoryContainer pvtSetting">
          <div className="pvtCateogryCard">
          <div className="card-header">
            <div className="card-title"
                style = {{display: "inline-block", minWidth:"40%"}}
                onClick={()=>this.setState({show: !this.state.show})}>
              Set OR Groups {this.state.open? ": Edit A Group" : ""}
            </div>
          </div>
          {this.state.show && (  <div className="card-body"> {/* className="modal-content" */}
                {!this.state.open && this.renderGroups()}
                {this.state.open && this.getFilterBox()}
            </div>)}
      </div>
        </div>
      );
    }
}