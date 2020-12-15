# react-pivottable-custom
This is a library with some customized functions based on `react-pivottable`, mainly for testing and demo. 

Please see [https://github.com/plotly/react-pivottable#readme](https://github.com/plotly/react-pivottable#readme) for more details of usage of the original table.

## Added features

### 1. Unused Attributes with categories
### 2. Set category level to display (Removed in new look)
### 3. Customized the default orders of unused attributes 
### 4. Add attribute filters for better user experience when there are more attributes
      - Update: change to search function on the top of the table
      - Update: fix the problem of `reset filters` will clean searchings
### 5. Add unclassfied attributes handler
### 6. Add Reset function
### 7. Add number configuration for each category
### 8. Add labels for each attributes for hover to show extra information 
```
 attrLabel: {[attrName]: "supplementary information"}
```
### 9. Add `Show All` button for each category with sub category
### 10. Customized styling without third-party library

## Usage 
### Configure categories for attributes
This fearture is mainly designed for scenario when there are lots of attributes to analyze, providing a better way to organize attributes.

See the example form NYC Open Data in `App.js`.

```JavaScript
                attrClassified: true,
                attrCategory:[
                    {
                        name: "Payer",
                        subcategory: [
                            {
                                name: "Test1",
                                attributes: ['Payer Smoker'],
                                subcategory: [
                                    {
                                        name: "Test2",
                                        attributes:  ['Payer Gender']
                                }
                                ]
                            },
                        ]
                    },
                    {
                        name: "Money",
                        attributes:  ['Tip', 'Total Bill'],
                    },
                    {
                        name: "Others",
                        // attributes: ['Day of Week','Meal','Party Size'],
                        subcategory:[
                            {
                                name: "Test1",
                                attributes: ['Meal'],
                                subcategory: [
                                    {
                                        name: "Test2",
                                        attributes:  ['Day of Week']
                                },{
                                    name: "Test3",
                                    attributes: ['Party Size']
                                }
                                ]
                            },
                        ]
                    }
                ],
```