const picContainer = document.getElementById("picContainer");
const loadingGif = document.getElementById("loadingGif");

// upload image collapse/expand

$("#uploadHeader").click(function() {
  $header = $(this);
  $content = $("#uploadBody");
  $content.slideToggle(500, function() {
    $("#UpDown").text(function() {
      return $content.is(":visible") ? "-" : "+";
    });
  });
});

// AJAX post and get requests -- upload a picture, get pictures (to display under recent images)

$("#submitPic").submit(function(event) {
  event.preventDefault();
  $("#loadingGif").show();
  var formData = new FormData($(this)[0]);
  $.ajax({
    url: "image-upload",
    type: "POST",
    data: formData,
    async: false,
    success: function(data) {
      $("#loadingGif").hide();
      getPictures();
      console.log(data);
      alert("Image uploaded successfully");
    },
    cache: false,
    contentType: false,
    processData: false
  });

  return false;
});

function getPictures() {
  $.ajax({
    type: "GET",
    url: "/userpictures",
    datatype: "json"
  })
    .done(data => {
      let pictures = data.pictures;
      let oldPics = pictures.slice(-5);

      $("#picContainer").empty();

      num = 2;

      for (let i = oldPics.length - 1; i >= 0; i--) {
        if (i == oldPics.length - 1) {
          $("#picContainer").append(
            `<img src="/images/copy.png" height="20px" width="20px" name=${
              oldPics[i].url
            } id="recent1">&nbsp <b>${oldPics[i].title}</b><br>`
          );
        } else {
          $("#picContainer").append(
            `<img src="/images/copy.png" height="20px" width="20px" name=${
              oldPics[i].url
            } id="recent${num}">&nbsp ${oldPics[i].title}<br>`
          );
          num = num + 1;
        }
      }
    })
    .fail((jqXHR, textStatus, err) => {});
}

// COPY TEXT TO CLIPBOARD

const recentImages = ["recent1", "recent2", "recent3", "recent4", "recent5"];

for (let i = 0; i < recentImages.length; i++) {
  document.addEventListener("click", event => {
    if (event.target && event.target.id == recentImages[i]) {
      console.log("hello");
      console.log(event.target.id);
      setClipboard(event.target.name);
      alert("Copied the text: " + event.target.name);
    }
  });
}

function setClipboard(value) {
  var tempInput = document.createElement("input");
  tempInput.style = "position: absolute; left: -1000px; top: -1000px";
  tempInput.value = value;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
}

// get posts and add more posts to the page

const list = document.getElementById("lists");
const addMore = document.getElementById("addMore");

const post = [];

index = 0;
marker = 5;

$.ajax({
  type: "GET",
  url: "/userposts",
  datatype: "json"
})
  .done(data => {
    posts = data.posts;

    for (let i = 0; i < posts.length; i++) {
      post.push(posts[i]);
    }

    if (posts.length < 5) {
      for (i = 0; i < post.length; i++) {
        let node = document.createElement("LI");
        node.className = "list-group-item";
        node.innerHTML =
          post[i].title +
          "<span id='listLink'><a class='class='alert-link' href='post/" +
          posts[i]._id +
          "'>Edit</a> | <a class='class='alert-link' href='post/delete/" +
          posts[i]._id +
          "?_method=DELETE'>Delete</a></span>";
        list.appendChild(node);
      }
    } else {
      for (index; index < marker; index++) {
        let node = document.createElement("LI");
        node.className = "list-group-item";
        node.innerHTML =
          post[index].title +
          "<span id='listLink'><a class='class='alert-link' href='post/" +
          posts[index]._id +
          "'>Edit</a> | <a class='class='alert-link' href='post/delete/" +
          posts[index]._id +
          " ?_method=DELETE'>Delete</a></span>";
        list.appendChild(node);
      }
    }
    index = marker;
    marker = marker + 5;
  })
  .fail((jqXHR, textStatus, err) => {});

if (post.length < 5) {
  addMore.style.display = "none";
}

addMore.addEventListener("click", () => {
  for (index; index < marker; index++) {
    let node = document.createElement("LI");
    node.className = "list-group-item";
    node.innerHTML =
      post[index].title +
      "<span id='listLink'><a class='class='alert-link' href='post/" +
      posts[index]._id +
      "'>Edit</a> | <a class='class='alert-link' href='post/delete/" +
      posts[index]._id +
      " ?_method=DELETE'>Delete</a></span>";
    list.appendChild(node);
    console.log(marker);
  }

  if (post.length - marker < 5) {
    index = marker;
    marker = marker + (post.length - marker);
  } else {
    index = marker;
    marker = marker + 5;
  }

  if (index == post.length) {
    addMore.style.display = "none";
  }
});
