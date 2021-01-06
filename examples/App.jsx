import React from 'react';
import tips from './test_data_1';
import {sortAs} from '../src/Utilities';
import TableRenderers from '../src/TableRenderers';
import createPlotlyComponent from 'react-plotly.js/factory';
import createPlotlyRenderers from '../src/PlotlyRenderers';
import PivotTableUI from '../src/PivotTableUI';
import '../src/pivottable.css';
import Dropzone from 'react-dropzone';
import Papa from 'papaparse';

const Plot = createPlotlyComponent(window.Plotly);

class PivotTableUISmartWrapper extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {pivotState: props};
    }

    componentWillReceiveProps(nextProps) {
        this.setState({pivotState: nextProps});
    }

    render() {
        return (
            <PivotTableUI
                renderers={Object.assign(
                    {},
                    TableRenderers,
                    createPlotlyRenderers(Plot)
                )}
                {...this.state.pivotState}
                onChange={s => this.setState({pivotState: s})}
                unusedOrientationCutoff={Infinity}
            />
        );
    }
}

export default class App extends React.Component {
    componentWillMount() {
        const attributes = ['Ethnicity', 'Date_Of_Establishment', 'Aggregate_Bonding_Limit', 'Signatory_To_Union_Contracts', 'Business_Description', 'Goods_Materials_Suplier', 'Types_of_Construction_Projects',  'DATEOFJOB4', 'EXPERIENCE4'];
        //  const attrLabel = attributes.map(x=>{return {[x]:x}});
        const attrLabel = {};
        attributes.forEach(attr=>{
            attrLabel[attr] = attr;
        });
        this.setState({
            mode: 'demo',
            filename: 'Sample Dataset: Tips',
            pivotState: {
                data: tips,
                // Added attributes
                attrLabel: attrLabel,
                attrClassified: true,
                attrCategory:[
                    {
                        name: "Basic information",
                        attributes: attributes,
                        // attributes: ['Ethnicity', 'Date_Of_Establishment', 'Aggregate_Bonding_Limit', 'Signatory_To_Union_Contracts', 'Business_Description', 'Goods_Materials_Suplier', 'Types_of_Construction_Projects',  'DATEOFJOB4', 'EXPERIENCE4'],
                        subcategory: [
                           {
                            name: "Web",
                            attributes: [ 'Website'],
                            subcategory: [
                                {
                                    name: "Vendor",
                                    attributes: ['Vendor_Formal_Name', 'Vendor_DBA']
                                }
                            ]
                           },
                           {
                               name: "Job",
                               attributes: ['Job_Exp1_Name_of_Client', 'Job_Exp1_Value_of_Contract', 'Job_Exp1_Percent_Self_Performed', 'DATEOFJOB1', 'EXPERIENCE1', 'Job_Exp2_Name_of_Client', 'Job_Exp2_Value_of_Contract', 'Job_Exp2_Percent_Self_Performed', 'DATEOFJOB2', 'EXPERIENCE2', 'Job_Exp3_Name_of_Client', 'Job_Exp3_Value_of_Contract', 'Job_Exp3_Percent_Self_Performed', 'DATEOFJOB3', 'EXPERIENCE3', 'Job_Exp4_Name_of_Client', 'Job_Exp4_Value_of_Contract', 'Job_Exp4_Percent_Self_Performed']

                           }
                        ]
                    },
                    {
                        name: "Contact",
                        attributes: ['Contact_Name', 'telephone', 'fax', 'Email']
                    },
                    {
                        name: "Cert",
                        attributes: ['certification', 'Cert_Renewal_Date']
                        
                    },
                    
                    {
                        name: "Address",
                        attributes: ['Address1', 'Address2', 'City', 'State', 'ZIP']
                    },
                ],
                unclassifiedAttrName: "Others",
                attrOrder: [],
                // Orignial
                rows: ['Address1'],
                cols: ['Address2'],
                aggregatorName: 'Count',
                vals: [],
                rendererName: 'Table',
                // sorters: {
                //     Meal: sortAs(['Lunch', 'Dinner']),
                //     'Day of Week': sortAs([
                //         'Thursday',
                //         'Friday',
                //         'Saturday',
                //         'Sunday',
                //     ]),
                // },
                plotlyOptions: {width: 900, height: 500},
                plotlyConfig: {},
                tableOptions: {
                    clickCallback: function(e, value, filters, pivotData) {
                        var names = [];
                        pivotData.forEachMatchingRecord(filters, function(
                            record
                        ) {
                            names.push(record.Contact_Name);
                        });
                        alert(names.join('\n'));
                    },
                },
            },
        });
    }

    onDrop(files) {
        this.setState(
            {
                mode: 'thinking',
                filename: '(Parsing CSV...)',
                textarea: '',
                pivotState: {data: []},
            },
            () =>
                Papa.parse(files[0], {
                    skipEmptyLines: true,
                    error: e => alert(e),
                    complete: parsed =>
                        this.setState({
                            mode: 'file',
                            filename: files[0].name,
                            pivotState: {data: parsed.data},
                        }),
                })
        );
    }

    onType(event) {
        Papa.parse(event.target.value, {
            skipEmptyLines: true,
            error: e => alert(e),
            complete: parsed =>
                this.setState({
                    mode: 'text',
                    filename: 'Data from <textarea>',
                    textarea: event.target.value,
                    pivotState: {data: parsed.data},
                }),
        });
    }

    render() {
        return (
            <div>
              
                <div className="row">

                    <PivotTableUISmartWrapper {...this.state.pivotState} />
                </div>
            </div>
        );
    }
}
