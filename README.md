# react-pivottable-custom
This is a tested library with some customized functions based on `react-pivottable`. 

Please see [https://github.com/plotly/react-pivottable#readme](https://github.com/plotly/react-pivottable#readme) for more details of usage of the original table.

## Added features

### Unused Attributes with categories
Example:
```JavaScript
attrClassified: true,
attrDict:{
    "Payer": ['Payer Gender','Payer Smoker'],
    "Money": ['Tip', 'Total Bill'],
},
unclassifiedAttrName: "Others",
```

### Customized the default orders of unused attributes