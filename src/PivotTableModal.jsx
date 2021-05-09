import React from 'react';
import PropTypes from 'prop-types';
import Sortable from 'react-sortablejs';
import { HexColorPicker } from "react-colorful";
import "react-colorful/dist/index.css";
// import Draggable from 'react-draggable';

const colors = [
  "#00306F",
  "#929084",
  "#FFC857", 
  "#A997DF", 
  "#E5323B", 
  "#005FCC",
  "#004002",
  "#0079FA",
  "#00C2F9",
  "#005A01",
  "#009503"
]

function getUngroupedValues(allValues, groups){
  const groupedValues = [];
  for (const [key, values] of Object.entries(groups)){
    groupedValues.push.apply(groupedValues, Object.keys(values));
  }
  const ungroupedValues = allValues.filter(value=>groupedValues.findIndex(groupedValue=>String(value).toLowerCase() === String(groupedValue).toLowerCase()) === -1);
  return ungroupedValues;
}

function makeDnDAttrs(groupName, onChangeAttr, groupValues, groupColor){
  // console.log(this.props.attrGroupsColor);
  // const groupColor = this.props.attrGroupsColor ? this.props.attrGroupsColor[groupName]: undefined;

  const attrStyle = groupColor || {};
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

export class UngroupedAttrs extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      ungroupedValues: [],
    }
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

  render(){
    const onChangeUngrouped = order=>this.setState({ungroupedValues:order});
    return(<div className="pvtCategoryContainer">
    <div className="pvtCateogryCard">
    <div className="card-header"
        onClick = {this.props.toggleConfig}
    >
      <div className="card-title"
          style = {{display: "inline-block", minWidth:"40%"}}
         >
        Set OR Groups 
      </div>
    </div>

      <div className="card-body">
    
       {this.props.show && (<div className="modal-group-div ungrouped-div">
             <span style={{fontSize: "14px"}}>Ungrouped Attributes</span>
            {makeDnDAttrs('Ungrouped Attrs', onChangeUngrouped, this.state.ungroupedValues)}
      </div>)}
      </div>

  </div>
    </div>)
  }
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
            groupStyle: {},
            editColorMode: 0,
            showColorPicker: false,
            selectValues: {},
            errors: {},
            ungroupedValues: [],
            showEditAttr: false,
            fakeVals: []
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
          // const groupColor = this.state.groupColor;
          const groupStyle = Object.assign({}, this.state.groupStyle);
          const newValues = Object.assign({}, this.state.selectValues);
        
          this.props.setGroupValue(groupName, newValues, origName, groupStyle);
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
                <span className='label'>Background Color  </span>
                <div
                  className="swatch"
                  style = {{backgroundColor: this.state.groupStyle.backgroundColor}}
                  onClick = {()=>{
                    if(this.state.editColorMode === 1){
                      this.setState({showColorPicker: !this.state.showColorPicker})
                    }else{
                      this.setState({showColorPicker: true,
                        editColorMode: 1,
                        })
                    }
                  }}

                />

              <span className='label'>Font Color  </span>
                <div
                  className="swatch"
                  style = {{backgroundColor: this.state.groupStyle.color}}
                  onClick = {()=>{
                    if(this.state.editColorMode === 2){
                      this.setState({showColorPicker: !this.state.showColorPicker})
                    }else{
                      this.setState({showColorPicker: true,
                        editColorMode: 2,
                        })
                    }
                  }}

                  />
                {
                  this.state.showColorPicker && (<div className="color-picker"> 
                   <span className="label">{this.state.editColorMode === 1 ? "Choose a background color: " : "Choose a font color: "}</span>
                   <HexColorPicker color={this.state.editColorMode === 1? this.state.groupStyle.backgroundColor : this.state.groupStyle.color} 
                      onChange={color=>{
                        const newStyle = Object.assign({}, this.state.groupStyle);
                        if(this.state.editColorMode===1){
                          newStyle.backgroundColor = color;
                        } else {
                          newStyle.color = color;
                        }
                        this.setState({groupStyle: newStyle});
                      }}/>
                  </div>)
                }
              
                        
              </div>

              <div className="form-row">
                <span className="label">Group Attributes</span>
                <div className="modal-group-div">
                {this.makeDnDAttrs(this.state.alterGroupName, order=>this.setState({
                  selectValues: order.reduce((res, value)=>{
                    res[value] = true;
                    return res;
                  }, {})
                }), 
                Object.keys(this.state.selectValues),
                this.state.groupStyle)
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
                    className="pvtButton primary"
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
    makeDnDAttrs(groupName, onChangeAttr, groupValues, groupStyle){
      // console.log(this.props.attrGroupsColor);
      // const groupColor = this.props.attrGroupsColor ? this.props.attrGroupsColor[groupName]: undefined;

      const attrStyle = groupStyle || {};
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
    
    fakeSortable(paddingSize){
      // const onChange =  
      const groupNum = this.props.groups? Object.keys(this.props.groups).length : 0;
      const defaultName = `group-${groupNum + 1}`;
      const nums = this.props.groups ? Object.keys(this.props.groups).length : 0;
      const valueAsObject = {};
      const test = (l) => {
        this.setState({fakeVals: l})
      }
      return(
        <Sortable
          key = {"no Group"}
          options={{
            group: 'group-attrs',
            ghostClass: 'pvtPlaceholder',
            filter: '.pvtFilterBox',
            preventOnFilter: false,
          }}
        tag="div"
        style = {{paddingBottom: paddingSize}}
        onChange={(order) => {
          this.setState({fakeVals: order});
          this.state.fakeVals.forEach(item=>{
                            valueAsObject[item] = true;
                        });
          this.setState({open: true, 
            selectGroup: "", 
            alterGroupName: defaultName, 
            selectValues: valueAsObject,
            groupStyle: {
              backgroundColor:  colors[nums % colors.length],
              color: "white"
            },
            });
            console.log(order)
            this.saveGroup()
          }}
        >
        </Sortable>
      )

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
          if (Object.keys(newValues).length === 0){
            this.props.deleteGroupValue(groupName)
          }
        }
        return(<div key= {groupName} className="modal-group-div">

            <div >
            <span style={{fontSize: "14px", verticalAlign: "middle"}}>{groupName}</span>
            <button 
                  className="pvtButton primary"
                  style={{float: "right"}}
                  onClick={()=>{
                  this.setState({
                    open: true, selectGroup: groupName, alterGroupName: groupName, selectValues: groupAttrObject, 
                    groupStyle: this.props.attrGroupsColor[groupName],
                    showEditAttr: false,
                    showColorPicker: false
                  });
              }}>Edit</button>
              
            <button 
                  className="pvtButton"
                  style={{float: "right"}}
                  onClick={()=>this.props.deleteGroupValue(groupName)}>Delete</button>
    

         
            </div>
         
          

           {this.makeDnDAttrs(groupName, onChangeAttr, groupValues,  this.props.attrGroupsColor ? this.props.attrGroupsColor[groupName]: undefined)}
            {/* {groupValues.map(value=>(<span key={value} className="modal-attr-span">{value}</span>))} */}
           
        </div>)
    }




    renderGroups(){

        // const onChangeUngrouped = order=>this.setState({ungroupedValues:order});
     
        return(<div>
            {/* <div className="modal-group-div ungrouped-div">
             <span style={{fontSize: "14px"}}>Ungrouped Attributes</span>
              {this.makeDnDAttrs('Ungrouped Attrs', onChangeUngrouped, this.state.ungroupedValues)}
            </div> */}
              {
                this.props.groups && Object.keys(this.props.groups).length > 0 && ( <div className="ungrouped-div">
                {Object.keys(this.props.groups).map(group=>{
                    return this.renderGroupDetails(group, this.props.groups[group])
                })}
              </div>)
              }
            {/* <button 
                 className="pvtSettingButton"
                //  style={{float: "right"}}
                onClick={()=>{
                const groupNum = this.props.groups? Object.keys(this.props.groups).length : 0;
                const defaultName = `group-${groupNum + 1}`
                this.setState({open: true, 
                  selectGroup: "", 
                  alterGroupName: defaultName, selectValues:{}, 
                  groupStyle: {
                    backgroundColor:  colors[nums % colors.length],
                    color: "#506784"
                  },
                showEditAttr: false,
                showColorPicker: false
            })
            }}>Add New Group</button> */}
        </div>)
    }


    render(){
      // className="modal" style = {{zIndex: this.props.zIndex || 1000}}
      const nums = this.props.groups ? Object.keys(this.props.groups).length : 0;
        return (<div className="pvtCategoryContainer pvtSetting">
          <div className="pvtCateogryCard">
          <div className="card-header"
             
          >
            <div className="card-title"
                style = {{display: "inline-block", minWidth:"40%", minHeight:"10px"}}
                onClick={this.props.toggleConfig}
            >

         

              {/* Set OR Groups {this.state.open? ": Edit A Group" : ""} */}
            </div>

            {/* {this.props.show && (<div
            // className="dropdown dropleft"
              style={{float: "right", display: "inline-block"}}
            >
               {this.state.open ? (<button role="button"
                    className="pvtButton"
                    onClick={()=>this.setState({open: false, selectGroup: "", alterGroupName: "", selectValues: {}})}
                    >
                      Cancel
                  </button>)
              :( <button 
                    className="pvtSettingButton"
                    onClick={()=>{
                    this.props.handleOpen();
                    const groupNum = this.props.groups? Object.keys(this.props.groups).length : 0;
                    const defaultName = `group-${groupNum + 1}`
                    this.setState({open: true, 
                      selectGroup: "", 
                      alterGroupName: defaultName, selectValues:{}, 
                      groupStyle: {
                        backgroundColor:  colors[nums % colors.length],
                        color: "white"
                      },
                    showEditAttr: false,
                    showColorPicker: false
              })
         }}>Add New Group</button>)}

            </div>)} */}
          </div>
          {this.props.show && (  <div className="card-body"> {/* className="modal-content" */}
                {!this.state.open && this.renderGroups()}
                {!this.state.open && Object.keys(this.props.groups).length === 0 && this.fakeSortable("60px")}
                {!this.state.open && Object.keys(this.props.groups).length === 1 && this.fakeSortable("40px")}
                {!this.state.open && Object.keys(this.props.groups).length > 1 && this.fakeSortable("20px")}
                {!this.state.open && Object.keys(this.props.groups).length === 0 && 
                  <div style = {{textAlign: "center", color: "#666767de"}}>
                    Drag attribute above to create group
                  </div>}
                {!this.state.open && Object.keys(this.props.groups).length === 1 && 
                <div style = {{textAlign: "center", color: "#666767de"}}>
                  Drag new attribute below group above to create another group
                </div>}
                {this.state.open && this.getFilterBox()}
            </div>)}
      </div>
        </div>
      );
    }
}