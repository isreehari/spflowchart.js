'use strict';

//https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd

var margin = {top : 20, right: 90, bottom: 30, left: 90};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var canvas = d3.select(".spflowchart")
                .append("svg")
                .attr("width",width + margin.left + margin.right)
                .attr("height",height + margin.top + margin.bottom)
                .append("g") // grouping the elements
                .attr("transform", "translate("+ margin.left +","+margin.top+")");

var i = 0,
    duration = 750,
    root;
// Declaring a tree layout and assigns the size
var treemap = d3.tree().size([height,width]);

// Assigns parent, children, height, depth
var treeData = null;

d3.json("assets/data/treeData.json",function(data){

      treeData = data;      
      root = d3.hierarchy(treeData,function(d){ return d.children;});
      root.x0 = height / 2;
      root.y0 = 0;

      root.children.forEach(collapse);
      update(root);



});


// Collapse the node and all it's children

function collapse(d){
      if(d.children){
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
      }
}

function update(source){
      // Assigns the x and y position for the nodes

      var treeData = treemap(root);

      // Compute the new tree layout.
      var nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(function(d){ d.y = d.depth * 180 });

      /* Nodes section */

      var node = canvas.selectAll("g.node")
                    .data(nodes,function(d){ return d.id || (d.id = ++i); });
      
      // Enter any new nodes at the parent's previous position. 
      var nodeEnter = node.enter().append("g")
                                  .attr("class","node")
                                  .attr("transform", function(d){ 
                                        return "translate("+ source.y0 + ","+ source.x0 +")";
                                  }).on("click",click);

           // Add circle for the nodes
           nodeEnter.append("circle")
                    .attr("class","node") 
                    .attr("r",1e-6)
                    .style("fill", function(d){ return d._children ? "lightsteelblue": "#fff"});

            // Add labels for the nodes
            nodeEnter.append("text")
                     .attr("dy",".35em")
                     .attr("x",function(d){ return d.children || d._children ? -13 : 13; })
                     .attr("text-anchor", function(d){ return d.children || d._children ? "end" : "start";  })
                     .text(function(d){ return d.data.name});

            // Update
            var nodeUpdate = nodeEnter.merge(node);

            //Transition to the proper position for the node
            nodeUpdate.transition()
                      .duration(duration)
                      .attr("transform",function(d){ return "translate("+ d.y +","+ d.x +")"; });
            
            // Update the node attributes and style
            nodeUpdate.select("circle.node")
                      .attr("r",10)
                      .style("fill",function(d){ })
                      .attr("cursor","pointer");

            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                                      .duration(duration)
                                      .attr("transform", function(d){ return "translate("+ source.y +"," + source.x +")"; })
                                      .remove();
            // On exit reduce the circles size to 0
            nodeExit.select("cicle")
                    .attr("r",1e-6);

            // On exit reduce the opacity of text lables
            nodeExit.select("text")
                    .style("fill-opacity", 1e-6);                                  

      /* end nodes section */

      /*  Links section */

      // Update the links
          var link = canvas.selectAll("path.link")
                        .data(links,function(d){ return d.id; });
      // Entery any new links at the parent's previous position
          var linkEnter = link.enter().insert("path","g")
                                     .attr("class","link")
                                     .attr("d",function(d){ var o = {x:source.x0, y:source.y0}; return diagonal(o,o)});

      // UPDATE
          var linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
          linkUpdate.transition()
                    .duration(duration)
                    .attr("d", function(d){ return diagonal(d, d.parent) });

      // Remove any exiting links
          var linkExit = link.exit().transition()
                                    .duration(duration)
                                    .attr("d", function(d){ var o = {x:source.x, y: source.y}; return diagonal(o,o); })
                                    .remove();
      // Store the old positions for transition 
      nodes.forEach(function(d){
              d.x0 = d.x;
              d.y0 = d.y;
       });


      /* end Links section */

} // end update function

// Creates a curved (diagonal) path from parent to child nodes
function diagonal(s,d){
        var path = `M ${s.y} ${s.x}
                    C ${(s.y + d.y) / 2} ${s.x},
                      ${(s.y + d.y) / 2} ${d.x},   
                      ${d.y} ${d.x}`;

        return path;
}

// Toggle children on click
function click(d){
      if(d.children){
            d._children = d.children;
            d.children = null;
      }else{
            d.children = d._children;
            d._children = null;
      }

      update(d);
}




