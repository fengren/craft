$("#bt_node_add").click(function() {
    $("#node-add-modal").modal("show");
    $("#node-add-content").load("/nodes/add/", function() {
        $("#bt_node_adds").click(function() {
            $.ajax({
                type: "POST",
                url: "/nodes/add/",
                data: $("#form_node_add").serialize() ,
                datatype: "json",
                beforeSend: function(){
                    $("#node-add-modal").modal("hide");
                },
                success: function(data){
                    //console.log('success');
                },
                complete: function(XMLHttpRequest, textStatus){
                    //
                    //console.log('complete');
                },
                error: function(){
                    //
                    //console.log('error');
                }
            })<!--End Ajax-->
        })<!--End bt_node_adds-->
    })<!--End node-add-content-->
}); <!--End-->
