import React from 'react';
import PropTypes from 'prop-types';
// import Sortable from 'react-sortablejs';
// import Draggable from 'react-draggable';

export default class ConfigModal extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            open: false, 
            filterText: '', 
            selectGroup: '',
            alterGroupName: '',
            selectValues: {},
            errors: {},
        };
    }

    closeEditMode(){
        this.setState({open: false, selectGroup: "", alterGroupName: "", filterText:"", selectValues: {}});
    }

    matchesFilter(x) {
        // change to multiple conditions
        // console.log(x);
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
          console.log('in modal', this.state)
          const origName = this.state.selectGroup;
          const groupName = this.state.alterGroupName;
          const newValues = Object.assign({}, this.state.selectValues);
          this.props.setGroupValue(groupName, newValues, origName);
        //   this.setState({open: false, selectGroup: "", alterGroupName: "", selectValues: {}});
            this.closeEditMode();
      }



    getFilterBox() {
        const showMenu = true;
        //   this.props.values.length < this.props.menuLimit;
        // console.log(this.props.values.slice(0));
        // todo: change values
        const values = this.props.values.slice(0); 
        const shown = values
          .filter(this.matchesFilter.bind(this))
          .sort(this.props.sorter);
        
        //   console.log(shown);
         
       const divStyle = {
          display: 'block',
          cursor: 'initial',
          width: '100%'
        //   zIndex: this.props.zIndex,
        };
    //     if(this.props.rowHeight) {
    //       divStyle.top = this.props.rowHeight;
    //     }
    //     if(this.props.searchDropDown) {// modified for search filter box
    //       divStyle.right = '40px' 
    //     }
        return (

            <div>
                <h3>Set a Group</h3>
    
              {showMenu || <p>(too many values to show)</p>}
    
              {showMenu && (
                <div style={divStyle}>
                     <input
                        type="text"
                        style={{width: "80%", minHeight: "26px"}}
                        placeholder="Group Name"
                        // className="pvtSearch"
                        value={this.state.alterGroupName}
                        onChange={e =>
                        this.setState({
                           alterGroupName: e.target.value,
                        })
                        }
                    />

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
                </div>
              )}
    
    
              {showMenu && (
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
              )}

              <div>
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
              </div>
            </div>
        );
      }
    

    renderGroupDetails(groupName, groupAttrObject){
        // const groupValues = Object.keys(groupAttrObject).reduce(res, item=>{
        //     if(groupAttrObject[item] === true){
        //         res.push(item);
        //     }
        //     return res;
        // }, []);

        const groupValues = Object.keys(groupAttrObject);
        
        return(<div key= {groupName} className="modal-group-div">
            <div >
            <span style={{fontSize: "18px"}}>{groupName}</span>
            <button 
                className="pvtButton"
                style={{float: "right"}}
                onClick={()=>{
                this.setState({open: true, selectGroup: groupName, alterGroupName: groupName, selectValues: groupAttrObject});
            }}>Edit Group </button>
            </div>
         
            <div>
            {groupValues.map(value=>(<span key={value} className="modal-attr-span">{value}</span>))}
            </div>
           
        </div>)
    }


    renderGroups(){

        return(<div>
            {Object.keys(this.props.groups).map(group=>{
                return this.renderGroupDetails(group, this.props.groups[group])
            })}
            <button 
                 className="pvtButton"
                //  style={{float: "right"}}
                onClick={()=>{
                this.setState({open: true, selectGroup: "", alterGroupName:"", selectValues:{}})
            }}>Add New Group</button>
        </div>)
    }


    render(){
        return this.props.show? (<div className="modal" style = {{zIndex: this.props.zIndex || 1000}}>

            <div className="modal-content">
                <div className="modal-header">
                  <span className="close" onClick={()=>{
                      this.closeEditMode();
                      this.props.handleClose();
                  }}>&times;</span>
                </div>
                {!this.state.open && this.renderGroups()}
                {this.state.open && this.getFilterBox()}
                {/* {this.getFilterBox()} */}
            </div>
      </div>
      ): null;
    }
}