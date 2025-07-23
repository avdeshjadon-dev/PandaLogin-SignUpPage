const firebaseConfig = {
  apiKey: "AIzaSyCwkRk12HxQlQS2DH12lcolRNvF2ALprZM",
  authDomain: "comix-9be69.firebaseapp.com",
  projectId: "comix-9be69",
  storageBucket: "comix-9be69.appspot.com",
  messagingSenderId: "346083786632",
  appId: "1:346083786632:web:f95c8c3dacafe47f23843d",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

$(function () {
  let focusTimeout;

  // Panda animation for password fields
  $("#password, #confirm-password")
    .focusin(function () {
      clearTimeout(focusTimeout);
      $("form").addClass("up");
      $(".eye-ball").fadeOut(100);
    })
    .focusout(function () {
      focusTimeout = setTimeout(function () {
        if (
          !$("#password").is(":focus") &&
          !$("#confirm-password").is(":focus")
        ) {
          $("form").removeClass("up");
          $(".eye-ball").fadeIn(100);
        }
      }, 50);
    });

  // Panda eye tracking
  $(document).on("mousemove", function (event) {
    if ($(".eye-ball").is(":visible")) {
      let dw = $(document).width() / 15;
      let dh = $(document).height() / 15;
      let x = event.pageX / dw;
      let y = event.pageY / dh;
      $(".eye-ball").css({ width: x, height: y });
    }
  });

  // Show/hide password
  $(".view-password").on("click", function () {
    const passwordInput = $(this).siblings(".form-control");
    const type =
      passwordInput.attr("type") === "password" ? "text" : "password";
    passwordInput.attr("type", type);
    $(this).toggleClass("fa-eye fa-eye-slash");
  });

  // Alert handling
  let alertTimeout;
  function showAlert(message, type = "error") {
    clearTimeout(alertTimeout);
    const alertBox = $("#alert-box");
    alertBox.text(message).removeClass("success error").addClass(type).fadeIn();
    if (type === "error") {
      $("form").addClass("wrong-entry");
      alertTimeout = setTimeout(function () {
        $("form").removeClass("wrong-entry");
        alertBox.fadeOut();
      }, 3000);
    }
  }

  // Firebase auth error handling
  function handleAuthError(err) {
    let message = "An unknown error occurred.";
    switch (err.code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":
      case "auth/wrong-password":
        message = "Incorrect email or password.";
        break;
      case "auth/email-already-in-use":
        message = "This email is already registered.";
        break;
      case "auth/invalid-email":
        message = "Please enter a valid email address.";
        break;
      case "auth/weak-password":
        message = "Password must be at least 8 characters long.";
        break;
      default:
        message = "Please check your details.";
        break;
    }
    showAlert(message, "error");
  }

  // Login form submission
  if ($("#login-form").length) {
    $("#login-form").on("submit", function (e) {
      e.preventDefault();
      const email = $("#email").val();
      const password = $("#password").val();
      if (!email || !password) {
        return showAlert("Please fill in all fields.");
      }
      auth
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          showAlert("Successfully logged in!", "success");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        })
        .catch(handleAuthError);
    });
  }

  // Signup form submission
  if ($("#signup-form").length) {
    $("#signup-form").on("submit", function (e) {
      e.preventDefault();
      const name = $("#name").val().trim();
      const email = $("#email").val().trim();
      const password = $("#password").val();
      const confirmPassword = $("#confirm-password").val();

      if (name.length < 3)
        return showAlert("Name must be at least 3 characters.");
      if (password.length < 8)
        return showAlert("Password must be at least 8 characters.");
      if (password !== confirmPassword)
        return showAlert("Passwords do not match.");

      auth
        .createUserWithEmailAndPassword(email, password)
        .then((cred) => {
          showAlert("Account created successfully!", "success");
          const presetAvatars = Array.from(
            { length: 10 },
            (_, i) =>
              `https://api.dicebear.com/7.x/pixel-art/svg?seed=${i + 1}&size=40`
          );
          return db
            .collection("users")
            .doc(cred.user.uid)
            .set({
              displayName: name,
              email: email,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              avatarUrl:
                presetAvatars[Math.floor(Math.random() * presetAvatars.length)],
              favorites: [],
            });
        })
        .then(() => {
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        })
        .catch(handleAuthError);
    });
  }
});
