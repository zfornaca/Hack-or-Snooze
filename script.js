$(function() {
  var $ol = $('ol');

  /////////////// get the 10 latest stories //////////////

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

  /////////////// add or remove from favorites //////////////

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

  ////////////// create new user //////////////

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

  ///////// log in existing user //////////////

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

  //////////// display user profile /////////////

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
        $('#profUsername').text(response.data.username);
        $('#profName').text(response.data.name);
        let favs = response.data.favorites;
        let stories = response.data.stories;
        for (let i = 0; i < favs.length; i++) {
          let storyID = favs[i].storyId;
          let url = favs[i].url;
          let li = $('<li>').append(
            $(`<span class="star" id="${storyID}">`).text('★')
          );
          $('#profFavs').append(
            li.append($(`<a href="${url}">`).text(favs[i].title))
          );
          // $('#profFavs').append($('<li>').text(favs[i].title));
        }
        for (let i = 0; i < stories.length; i++) {
          let storyID = stories[i].storyId;

          $('#profPosted').append(
            $('<li>')
              .text(stories[i].title)
              .append($(`<span class="trash" id="${storyID}">`).text('🗑'))
          );
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  /////////////// trash user-posted stories /////////////////

  $('#profPosted').on('click', '.trash', function(e) {
    // console.log('====');
    let storyID = e.target.getAttribute('id');
    $.ajax(`https://hack-or-snooze.herokuapp.com/stories/${storyID}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(response => {
      console.log(response);
      e.target.parentNode.remove();
    });
  });

  //////////////// unfavoriting profile favorites ////////////

  $('#profFavs').on('click', '.star', function(e) {
    // console.log('====');
    let storyID = e.target.getAttribute('id');
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
      e.target.parentNode.remove();
    });
  });

  /////// submit new story ///////////////

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
