function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function usePartsLib(file, path) {
  console.log(file, path)
  $.get("./partslib/DXF/" + path + "/" + file, function(data) {
    // console.log(data)
    drawDXF(data, file);
    printLog('DXF Opened', msgcolor, "file");
    // putFileObjectAtZero();
    resetView();
    // $("#partslibModal").modal('hide')
    Metro.dialog.close('#partslibModal')
    fillTree();
  });
}

$(document).ready(function() {
  console.log("Loading PartsLib")
  $.get("./partslib/data.json", function(data) {

    var template = `
    <style>

      .image {
        opacity: 1;
        display: block;
        transition: .5s ease;
        backface-visibility: hidden;
      }

      .middle {
        transition: .5s ease;
        opacity: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        text-align: center;
      }

      .img-thumbnail:hover .image {
        opacity: 0.3;
      }

      .img-thumbnail:hover .middle {
        opacity: 1;
      }

    </style>`


    template += `<ul class="tabs-expand-sm" data-role="tabs">`
    for (i = 0; i < data.children.length; i++) {
      template += `<li>
                      <a href="#` + data.children[i].name + `">
                        ` + data.children[i].name + `
                      </a>
                    </li>`
    }
    template += `</ul>

      `
    console.log(template)
    for (i = 0; i < data.children.length; i++) {
      var folder = data.children[i]
      var count = folder.children.length
      // console.group(folder.name, count)

      template += `<div id="` + data.children[i].name + `" class="p-1"><div class="container-fluid"><div class="row">`;

      // console.log(folder.name)

      if (folder.children.length == 0) {
        template += `This category is empty. Check back later`
      }

      for (j = 0; j < folder.children.length; j++) {
        if (j % 3 === 0) {
          template += `</div><p><div class="row">`
        }
        var file = folder.children[j]
        var title = file.name.substring(0, file.name.length - 4);
        var path = file.path
        var imgurl = "./partslib/" + file.path + ".svg";
        var size = bytesToSize(file.size)
        // console.log(title, path, imgurl, size)
        template += `
        <div class = "cell-4">
          <div class="img-thumbnail" style=" -webkit-transform-style: preserve-3d; -moz-transform-style: preserve-3d; transform-style: preserve-3d; background-color: #f7f7f7; width: 160px; height: 160px;">
            <img class="image" style="position: relative; top: 50%; transform: perspective(1px) translateY(-50%); max-width: 150px; max-height: 150px;" src="` + imgurl + `" alt="` + title + `">
            <div class="middle">
                <a style="width: 100%;" href="./partslib/` + path + `" class="button primary"><i class="fas fa-cloud-download-alt" data-toggle="tooltip" data-placement="bottom" title="Download" ></i>Download</a><br><br>
                <button style="width: 100%;" onclick="usePartsLib('` + file.name + `','` + folder.name + `');" type="button" class="button primary" data-toggle="tooltip" data-placement="bottom" title="Use this part in CAM" ><i class="fas fa-plus"></i> Insert</button>
            </div>
          </div><!-- end of imgthumb -->
        ` + title + ` <small>[` + size + `]</small>
        </div><!-- end of col -->`
      }
      template += `</div></div></div>`
      // console.groupEnd()
    }
    // template += `</div>` // tab content end
    // console.log(template)
    $("#partslibrary").append(template)
    Metro.init()
  });
});