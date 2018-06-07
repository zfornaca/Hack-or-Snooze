$(function() {
  var $ol = $('ol');

  $.getJSON('https://hack-or-snooze.herokuapp.com/stories').then(response => {
    for (let i = 0; i < 10; i++) {
      var story = response.data[i].title;
      var url = response.data[i].url;
      var storyID = response.data[i].storyId;
      console.log(storyID);
      console.log(story);
      let li = $('<li>').append(
        $(`<span class="star" id="${storyID}">`).text('☆')
      );
      $ol.append(li.append($(`<a href="${url}">`).text(story)));
      // let li = $('<li>').append($(`<span>`).text('☆'));
      // $ol.append(li).append($(`<a href="${url}">`).text(story));
      // $(`<a src="${url}">`).text(story)
      // $body.append($('<div>').text(story));
    }
  });

  $('#stories').on('click', '.star', function(e) {
    // console.log('====');
    let storyID = e.target.getAttribute('id');
    if ($(e.target).text() === '☆') {
      $.ajax(
        `https://hack-or-snooze.herokuapp.com/users/${localStorage.getItem(
          'username'
        )}/favorites/${storyID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          data: {
            data: {
              storyId: storyID,
              username: localStorage.getItem('username')
            }
          }
        }
      ).then(response => {
        console.log(response);
        $(e.target).text('★');
      });
    } else if ($(e.target).text() === '★') {
      $.ajax(
        `https://hack-or-snooze.herokuapp.com/users/${localStorage.getItem(
          'username'
        )}/favorites/${storyID}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          data: {
            data: {
              storyId: storyID,
              username: localStorage.getItem('username')
            }
          }
        }
      ).then(response => {
        console.log(response);
        $(e.target).text('☆');
      });
    }
  });

  $('#newUser').on('submit', function(e) {
    e.preventDefault();
    let username = $('#newUsername').val();
    let name = $('#newName').val();
    let password = $('#newPassword').val();
    console.log(username);
    console.log(name);
    console.log(password);
    e.target.reset();
    $.post('https://hack-or-snooze.herokuapp.com/users', {
      data: {
        username: username,
        name: name,
        password: password
      }
    }).then(response => {
      console.log(response);
    });
  });

  $('#returnUser').on('submit', function(e) {
    e.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    console.log(username);
    console.log(password);
    e.target.reset();
    $.post('https://hack-or-snooze.herokuapp.com/auth/', {
      data: {
        username: username,
        password: password
      }
    }).then(response => {
      console.log(response);
      localStorage.setItem('username', username);
      let token = response.data.token;
      localStorage.setItem('token', token);
      console.log(localStorage.getItem('token'));
      console.log(token);
      displayProfile(username);
    });
  });

  function displayProfile(username) {
    $.ajax(`https://hack-or-snooze.herokuapp.com/users/${username}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      data: {
        data: {
          username: username
        }
      }
    })
      .then(response => {
        //
        $('#profile').append($('<div>').text(response.data.username));
        $('#profile').append($('<div>').text(response.data.name));
        let favs = response.data.favorites;
        let stories = response.data.stories;
        for (let i = 0; i < favs.length; i++) {
          $('#profile').append($('<div>').text(favs[i].title));
        }
        for (let i = 0; i < stories.length; i++) {
          $('#profile').append($('<div>').text(stories[i].title));
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  $('#newStory').on('submit', function(e) {
    e.preventDefault();
    let title = $('#storyTitle').val();
    let author = $('#storyAuthor').val();
    let link = $('#storyURL').val();
    console.log(link);
    e.target.reset();
    $.ajax('https://hack-or-snooze.herokuapp.com/stories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      data: {
        data: {
          title: title,
          author: author,
          url: link,
          username: localStorage.getItem('username')
        }
      }
    }).then(response => {
      console.log(response);
    });
  });
});
