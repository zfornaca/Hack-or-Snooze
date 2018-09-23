$(function() {
  var $ol = $('ol');

  /////// profile/main toggle ///////////////

  $('#profMainNav').on('click', function(e) {
    if ($(e.target).text() === 'Profile') {
      $('#newStory').slideUp('fast');
      $(e.target).text('Main');
    } else {
      $(e.target).text('Profile');
    }
    $('#submitNav').toggle();
    // 3) toggle the Main and Profile panes
    $('#profile').slideToggle('fast');
    $('#stories').slideToggle('fast');
  });

  /////////// submit toggle /////////////

  $('#submitNav').on('click', function() {
    $('#newStory').slideToggle('fast');
  });

  /////////// login/register toggle /////////////

  $('#loginNav').on('click', function() {
    $('#loginRegPanelHide').slideToggle('fast');
  });

  ///////////// log out ////////////////
  $('#logoutNav').on('click', function() {
    localStorage.setItem('token', '');
    localStorage.setItem('username', '');
    $('#profMainNav').hide();
    $('#profMainNav').text('Profile');
    $('#submitNav').hide();
    $('#newStory').hide();
    $('#loginNav').show();
    $('#logoutNav').hide();
    $('#stories').show();
    $('#profile').hide();
  });

  /////////////// display main feed ///////////////

  function displayMainFeed() {
    let userFavorites = [];
    let username = localStorage.getItem('username');
    if (username !== null) {
      $.ajax(`https://hack-or-snooze.herokuapp.com/users/${username}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(res => {
        let faves = res.data.favorites;
        if (faves.length > 0) {
          userFavorites = res.data.favorites.map(fave => fave.storyId);
        }
      });
    }
    $ol.empty();
    $.getJSON('https://hack-or-snooze.herokuapp.com/stories').then(response => {
      for (let i = 0; i < 10; i++) {
        var story = response.data[i].title;
        var url = response.data[i].url;
        var storyID = response.data[i].storyId;
        let li = $('<li>').append(
          $(`<span class="star" id="${storyID}">`).text('☆')
        );
        if (userFavorites.includes(storyID)) {
          li = $('<li>').append(
            $(`<span class="star" id="${storyID}">`).text('★')
          );
        }
        $ol.append(li.append($(`<a href="${url}">`).text(story)));
      }
    });
  }

  /////////////// get user favorites //////////////////

  function getUserFavorites() {}

  /////////////// get the initial 10 latest stories //////////////
  displayMainFeed();

  /////////////// add or remove from favorites //////////////

  $('#stories').on('click', '.star', function(e) {
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
        $(e.target).text('★');
        displayProfile(localStorage.getItem('username'));
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
        $(e.target).text('☆');
        displayProfile(localStorage.getItem('username'));
        displayMainFeed();
      });
    }
  });

  ////////////// create new user //////////////

  $('#newUser').on('submit', function(e) {
    e.preventDefault();
    let username = $('#newUsername').val();
    let name = $('#newName').val();
    let password = $('#newPassword').val();
    e.target.reset();
    $.post('https://hack-or-snooze.herokuapp.com/users', {
      data: {
        username: username,
        name: name,
        password: password
      }
    }).then(response => {});
  });

  ///////// log in existing user //////////////

  $('#returnUser').on('submit', function(e) {
    e.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    e.target.reset();
    $.post('https://hack-or-snooze.herokuapp.com/auth/', {
      data: {
        username: username,
        password: password
      }
    }).then(response => {
      localStorage.setItem('username', username);
      let token = response.data.token;
      localStorage.setItem('token', token);
      // login slide toggles
      $('#profMainNav').toggle();
      $('#submitNav').toggle();
      $('#loginNav').toggle();
      $('#logoutNav').toggle();
      $('#loginRegPanelHide').slideToggle('fast');
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
        $('#profFavs').empty();
        let favsTitle = $('<h3>').text('Your favorites:');
        $('#profFavs').append(favsTitle);
        $('#profPosted').empty();
        let postedTitle = $('<h3>').text('Your posted stories:');
        $('#profPosted').append(postedTitle);
        for (let i = 0; i < favs.length; i++) {
          let storyID = favs[i].storyId;
          let url = favs[i].url;
          let li = $('<li>').append(
            $(`<span class="star" id="${storyID}">`).text('★ ')
          );
          $('#profFavs').append(
            li.append($(`<a href="${url}">`).text(favs[i].title))
          );
          // $('#profFavs').append($('<li>').text(favs[i].title));
        }
        for (let i = 0; i < stories.length; i++) {
          let storyID = stories[i].storyId;
          let url = stories[i].url;
          let li = $('<li>').append(
            $(`<a href="${url}">`).text(stories[i].title)
          );

          $('#profPosted').append(
            $(li).append($(`<span class="trash" id="${storyID}">`).text(' 🗑'))
          );
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  /////////////// trash user-posted stories /////////////////

  $('#profPosted').on('click', '.trash', function(e) {
    let storyID = e.target.getAttribute('id');
    $.ajax(`https://hack-or-snooze.herokuapp.com/stories/${storyID}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(response => {
      displayProfile(localStorage.getItem('username'));
      displayMainFeed();
    });
  });

  /////// check for login on page load ////////
  if (localStorage.getItem('token')) {
    $('#profMainNav').toggle();
    $('#submitNav').toggle();
    $('#loginNav').toggle();
    $('#logoutNav').toggle();
    $('#loginRegPanelHide').slideUp('fast');
    displayProfile(localStorage.getItem('username'));
  }

  //////////////// unfavoriting profile favorites ////////////

  $('#profFavs').on('click', '.star', function(e) {
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
      displayProfile(localStorage.getItem('username'));
      displayMainFeed();
    });
  });

  /////// submit new story ///////////////

  $('#newStory').on('submit', function(e) {
    e.preventDefault();
    let title = $('#storyTitle').val();
    let author = $('#storyAuthor').val();
    let link = $('#storyURL').val();
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
      displayProfile(localStorage.getItem('username'));
      displayMainFeed();
    });
  });
});
