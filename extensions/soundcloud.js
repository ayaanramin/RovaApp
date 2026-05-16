// Name: SoundCloud API
// ID: SPsoundCloud
// Description: Fetch songs and statistics from SoundCloud.
// By: SharkPool & Manus AI
// License: MIT

// Version V.1.2.0

(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("SoundCloud API must be run unsandboxed");

  const menuIconURI =
"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMzIiIGhlaWdodD0iMjMyIiB2aWV3Qm94PSIwIDAgMjMyIDIzMiI+PGRlZnM+PGxpbmVhckdyYWRpZW50IHgxPSIyMzkuNjM0IiB5MT0iMzAzLjAwMSIgeDI9IjIzOS42MzQiIHkyPSI3MS4wMDEiIGdyYWRpZW50VW5pdHMgPSJ1c2VyU3BhY2VPblVzZSIgaWQ9ImEiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iI2JjNTgwMCIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2JjMTkwMCIvPj/bGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IHgxPSIyMzkuNjM0IiB5MT0iODMuMDAxIiB4Mj0iMjM5LjYzNCIgeTI9IjI5MS4wMDEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBpZD0iYiI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY3NjAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTIzOS42MzQgNzEuMDAxYzY0LjA2NSAwIDExNiA1MS45MzUgMTE2IDExNnMtNTEuOTM1IDExNi0xMTYgMTE2LTExNi01MS45MzUtMTE2LTExNiA1MS45MzUtMTE2IDExNi0xMTYiIGZpbGw9InVybCgjYSkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMjMuNjM0IC03MS4wMDEpIi8+PHBhdGggZD0iTTEzNS42MzQgMTg3LjAwMWMwLTU3LjQzNyA0Ni41NjItMTA0IDEwNC0xMDRzMTA0IDQ2LjU2MyAxMDQgMTA0YzAgNTcuNDM4LTQ2LjU2MiAxMDQtMTA0IDEwNHMtMTA0LTQ2LjU2Mi0xMDQtMTA0IiBmaWxsPSJ1cmwoI2IpIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTIzLjYzNCAtNzEuMDAxKSIvPjxwYXRoIGQ9Ik0zNS4wMiAxMTAuNDczYy4zODcgMCAuNjkzLjMwNS43NTMuNzMzbDIuMDEzIDE2LjE2Ny0yLjAxMyAxNS44MjJjLS4wNjEuNDI3LS4zNjYuNzMyLS43NTMuNzMyLS4zODYgMC0uNjkxLS4zMDUtLjc1Mi0uNzMybC0xLjc3LTE1LjgyMiAxLjc3LTE2LjE2OGMuMDYtLjQyNy4zNjYtLjczMi43NTItLjczMm0tNi42NS02LjIwM2MuMzY2IDAgLjY3MS4yODUuNzEyLjY5MWwxLjU2NiAxMC4wMDYtMS41NjYgOS44NDNjLS4wNC40MDctLjM0Ni42OTEtLjcxMi42OTEtLjM4NiAwLS42NzEtLjI4NC0uNzMyLS42OTFMMCA1Ny40OTFsMS4zMjItMTAuMDA1Yy4wNjEtLjQyNy4zNjYtLjcxMi43MzItLjcxMm0xMy43NDgtOS4zNzVjLjQ2NyAwIC44MzMuMzY2Ljg5NC45MTVsMS45MTIgMTkuMTc3LTEuOTEyIDE4LjQ4NmMtLjA0LjUwOS0uNDI3Ljg3NS0uODk0Ljg3NS0uNDY4IDAtLjg1NS0uMzg3LS44OTUtLjg5NWwtMS42ODgtMTguNDg2IDEuNjg4LTE5LjE3N2MuMDQtLjUyOS40MjctLjg5NS44OTUtLjg5NW03LjExOC0uNjcyYy41NDggMCAuOTk2LjQ0OCAxLjA1NyAxLjAxOGwxLjgxIDE5LjcyNi0xLjgxIDE5LjA3NmMtLjA2MS41OS0uNTA5IDEuMDM3LTEuMDU4IDEuMDM3cy0xLjAxNi0uNDQ4LTEuMDU3LTEuMDM3bC0xLjU4Ni0xOS4wNzYgMS41ODYtMTkuNzA2Yy4wNC0uNTkuNTA4LTEuMDM3IDEuMDU3LTEuMDM3bTEwLjEwOCAyMC43NjMtMS43MDkgMTkuMjE4Yy0uMDQuNjkyLS41NDkgMS4yLTEuMiAxLjJzLTEuMTgtLjUyOS0xLjIyLTEuMmwtMS41MDUtMTkuMjE4IDEuNTA1LTE4LjI4MmMuMDQtLjY5Mi41Ny0xLjIgMS4yMi0xLjIuNjMgMCAxLjE2LjUwOCAxLjIgMS4xOHptNC4zMzEtMzEuMTE0Yy43MTIgMCAxLjMyMi41OSAxLjM2MyAxLjM0MmwxLjU4NiAyOS43NTItMS41ODYgMTkuMjE4Yy0uMDQuNzUyLS42NTEgMS4zNDItMS4zNjMgMS4zNDItLjczMiAwLTEuMzIyLS41OS0xLjM2Mi0xLjM0MmwtMS40MDQtMTkuMjE4IDEuNDA0LTI5Ljc1MmMuMDQtLjc1My42My0xLjM0MiAxLjM2Mi0xLjM0Mm03LjE5OS02Ljg1NGMuNzkzIDAgMS40NjUuNjcxIDEuNTI2IDEuNDg1bDEuNDg0IDM2LjU2NS0xLjQ4NCAxOS4xMTZjLS4wNDEuODU0LS43MTIgMS41MDUtMS41MjYgMS41MDUtLjgzMyAwLTEuNDg0LS42NzEtMS41MjUtMS41MDVsLTEuMzIyLTE5LjA5NiAxLjMyMi0zNi41NjVjLjA0LS44NTQuNzEyLTEuNTA1IDEuNTI1LTEuNTA1bTcuNDYzLTMuMjk0Yy44OTYgMCAxLjYyOC43MzIgMS42NjggMS42ODhsMS4zODMgMzkuNjE1LTEuMzgzIDE4LjkxM3YtLjAyYy0uMDQuOTE1LS43NzIgMS42NDctMS42NjcgMS42NDdhMS42NyAx.NjcgMCAwIDEtMS42NjgtMS42NDdsLTEuMjItMTguOTEzIDEuMjItMzkuNjE2Yy4wMi0uOTM1Ljc1My0xLjY2NyAxLjY2OC0xLjY2N20xMC41MzQgNDEuMjYyLTEuMjgxIDE4Ljc5MWMtLjA0IDEuMDE3LS44MzQgMS44MS0xLjgzIDEuODFzLTEuNzktLjgxMy0xLjgzLTEuODFsLTEuMTQtMTguNzkgMS4xNC00MC45MzhjLjA0LTEuMDE3LjgzMy0xLjgxIDEuODMtMS44MS45OTYgMCAxLjc5Ljc5MyAxLjgzIDEuODF6bTQuMzcyLTQxLjg1MmMxLjA3OCAwIDEuOTMyLjg1NCAxLjk3MyAxLjk1MmwxLjE4IDM5LjktMS4xOCAxOC42Mjl2LS4wMmMtLjAyIDEuMDk3LS44OTUgMS45NzItMS45NzMgMS45NzJhMS45NyAxLjk3IDAgMCAxLTEuOTcyLTEuOTUybC0xLjAzNy0xOC42MDggMS4wMzctMzkuOWMuMDItMS4xMTkuODk1LTEuOTczIDEuOTcyLTEuOTczbTcuNTQ1IDEuMzAxYzEuMTYgMCAyLjA5NS45MzYgMi4xMzYgMi4xMTVsMS4wNzcgMzguNDM2LTEuMDc3IDE4LjUwN3YtLjAyYTIuMTQ0IDIuMTQ0IDAgMCAxLTIuMTM2IDIuMTE0IDIuMTMgMi4xMyAwIDAgMS0yLjEzNS0yLjExNWwtLjk1Ni0xOC40ODYuOTU2LTM4LjQzNmEyLjEzIDIuMTMgMCAwIDEgMi4xMzUtMi4xMTVtOC44NDctNy4wNzdhMi40OCAyLjQ4IDAgMCAxIDEuMDU3IDEuODkybC45NTYgNDUuNzM2LS44NzUgMTYuNTU0LS4xMDEgMS44MWMtLjAyLjYzLS4yODUgMS4yLS42OTIgMS42MDctLjQyNy40MDYtLjk3Ni42Ny0xLjYwNi42Ny0uNzEyIDAtMS4zMjItLjMyNS0xLjc1LS44MzNhMi4zIDIuMyAwIDAgMS0uNTI4LTEuMzYydi0uMDgybC0uODU0LTE4LjM4NC44NTQtNDUuMjljdi0uNDI2YTIuMzQgMi4zNCAwIDAgMSAxLjA1OC0xLjkxMiAyLjI3IDIuMjcgMCAwIDEgMS4yMi0uMzY2Yy40NjggMCAuODk1LjE0MiAxLjI2LjM4Nm03LjU2Ni00LjMzMWMuNjkxLjQyNyAxLjE4IDEuMiAxLjIgMi4wNTRsMS4wNzcgNDkuOTA1LTEuMDc3IDE4LjF2LS4wMmMtLjAyIDEuMzQyLTEuMTE5IDIuNDQtMi40NCAyLjQ0LTEuMzIzIDAtMi40Mi0xLjA5OC0yLjQ0MS0yLjQybC0uNDg4LTguOTI4LS41MDktOS4xNzIuOTk3LTQ5LjY0MXYtLjI0NGMwLS43NTIuMzY2LTEuNDI0Ljg5NS0xLjg3MWEyLjQzIDIuNDMgMCAwIDEgMi43ODYtLjIwM202Ny4wNDkgMjguMzY5YzEyLjI0MyAwIDIyLjE2NyA5LjkwNCAyMi4xNjcgMjIuMTI2IDAgMTIuMjQzLTkuOTI0IDIyLjA0NS0yMi4xNDcgMjIuMDQ1aC02MS4zOTVjLTEuMzIyLS4xMjItMi4zOC0xLjE4LTIuNC0yLjU0MlY3NS4xNDljLjAyLTEuMjgxLjQ2OC0xLjk1MiAyLjEzNS0yLjYwM2EzOS42IDM5LjYgMCAwIDEgMTQuMTc1LTIuNjQ0YzIwLjM5NyAwIDM3LjEzNCAxNS42NiAzOC45MDMgMzUuNjFhMjIuMiAyMi4yIDAgMCAxIDguNTYyLTEuNzA5IiBmaWxsPSIjZmZmIi8+PC9zdmc+";
  const blockIconURI =
"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxODAuMSIgaGVpZ2h0PSI3OC4xOTQiIHZpZXdCb3g9IjAgMCAxODAuMSA3OC4xOTQiPjxwYXRoIGQ9Ik04LjcwNCA0MC41NzFjLjM4NyAwIC42OTIuMzA1Ljc1My43MzNsMi4wMTMgMTYuMTY3LTIuMDEzIDE1LjgyMmMtLjA2MS40MjctLjM2Ni43MzItLjc1My43MzItLjM4NiAwLS42OTEtLjMwNS0uNzUyLS43MzJsLTEuNzctMTUuODIyIDEuNzctMTYuMTY3Yy4wNi0uNDI4LjM2Ni0uNzMzLjc1Mi0uNzMzbS02LjY1IDYuMjAzY2LjM2NiAwIC42NzEuMjg1LjcxMi42OTFsMS41NjYgMTAuMDYtMS41NjYgOS44NDNjLS4wNC40MDctLjM0Ni42OTEtLjcxMi42OTEtLjM4NiAwLS42NzEtLjI4NC0uNzMyLS42OTFMMCA1Ny40OTFsMS4zMjItMTAuMDA1Yy4wNjEtLjQyNy4zNjYtLjcxMi43MzItLjcxMm0xMy43NDgtOS4zNzVjLjQ2NyAwIC44MzMuMzY2Ljg5NC45MTVsMS45MTIgMTkuMTc3LTEuOTEyIDE4LjQ4NmMtLjA0LjUwOS0uNDI3Ljg3NS0uODk0Ljg3NS0uNDY4IDAtLjg1NS0uMzg3LS44OTUtLjg5NWwtMS42ODgtMTguNDg2IDEuNjg4LTE5LjE3N2MuMDQtLjUyOS40MjctLjg5NS44OTUtLjg5NW03LjExOC0uNjcyYy41NDggMCAuOTk2LjQ0OCAxLjA1NyAxLjAxOGwxLjgxIDE5LjcyNi0xLjgxIDE5LjA3NmMtLjA2MS41OS0uNTA5IDEuMDM3LTEuMDU4IDEuMDM3cy0xLjAxNi0uNDQ4LTEuMDU3LTEuMDM3bC0xLjU4Ni0xOS4wNzYgMS41ODYtMTkuNzA2Yy4wNC0uNTkuNTA4LTEuMDM3IDEuMDU3LTEuMDM3bTEwLjEwOCAyMC43NjMtMS43MDkgMTkuMjE4Yy0uMDQuNjkyLS41NDkgMS4yLTEuMiAxLjJzLTEuMTgtLjUyOS0xLjIyLTEuMmwtMS41MDUtMTkuMjE4IDEuNTA1LTE4LjI4MmMuMDQtLjY5Mi41Ny0xLjIgMS4yMi0xLjIuNjMgMCAxLjE2LjUwOCAxLjIgMS4xOHptNC4zMzEtMzEuMTE0Yy43MTIgMCAxLjMyMi41OSAxLjM2MyAxLjM0MmwxLjU4NiAyOS43NTItMS41ODYgMTkuMjE4Yy0uMDQuNzUyLS42NTEgMS4zNDItMS4zNjMgMS4zNDItLjczMiAwLTEuMzIyLS41OS0xLjM2Mi0xLjM0MmwtMS40MDQtMTkuMjE4IDEuNDA0LTI5Ljc1MmMuMDQtLjc1My42My0xLjM0MiAxLjM2Mi0xLjM0Mm03LjE5OS02Ljg1NGMuNzkzIDAgMS40NjUuNjcxIDEuNTI2IDEuNDg1bDEuNDg0IDM2LjU2NS0xLjQ4NCAxOS4xMTZjLS4wNDEuODU0LS43MTIgMS41MDUtMS41MjYgMS41MDUtLjgzMyAwLTEuNDg0LS42NzEtMS41MjUtMS41MDVMNDEuNzEgNTcuNTkzTDEuMzIyLTM2LjU2NWMuMDQtLjg1NC43MTItMS41MDUgMS41MjUtMS41MDVtNy40NjMtMy4yOTRjLjg5NiAwIDEuNjI4LjczMiAxLjY2OCAxLjY4OGwxLjM4MyAzOS42MTUtMS4zODMgMTguOTEzdi0uMDJjLS4wNC45MTUtLjc3MiAxLjY0Ny0xLjY2NyAxLjY0N2ExLjY3IDEuNjcgMCAwIDEtMS42NjgtMS42NDdsLTEuMjItMTguOTEzIDEuMjItMzkuNjE2Yy4wMi0uOTM1Ljc1My0xLjY2NyAxLjY2OC0xLjY2N20xMC41MzQgNDEuMjYyLTEuMjgxIDE4Ljc5MWMtLjA0IDEuMDE3LS44MzQgMS44MS0xLjgzIDEuODFzLTEuNzktLjgxMy0xLjgzLTEuODFsLTEuMTQtMTguNzkgMS4xNC00MC45MzhjLjA0LTEuMDE3LjgzMy0xLjgxIDEuODMtMS44MS45OTYgMCAxLjc5Ljc5MyAxLjgzIDEuODF6bTQuMzcyLTQxLjg1MmMxLjA3OCAwIDEuOTMyLjg1NCAxLjk3MyAxLjk1MmwxLjE4IDM5LjktMS4xOCAxOC42Mjl2LS4wMmMtLjAyIDEuMDk3LS44OTUgMS45NzItMS45NzMgMS45NzJhMS45NyAxLjk3IDAgMCAxLTEuOTcyLTEuOTUybC0xLjAzNy0xOC42MDggMS4wMzctMzkuOWMuMDItMS4xMTkuODk1LTEuOTczIDEuOTcyLTEuOTczbTcuNTQ1IDEuMzAxYzEuMTYgMCAyLjA5NS45MzYgMi4xMzYgMi4xMTVsMS4wNzcgMzguNDM2LTEuMDc3IDE4LjUwN3YtLjAyYTIuMTQ0IDIuMTQ0IDAgMCAxLTIuMTM2IDIuMTE0IDIuMTMgMi4xMyAwIDAgMS0yLjEzNS0yLjExNWwtLjk1Ni0xOC40ODYuOTU2LTM4LjQzNmEyLjEzIDIuMTMgMCAwIDEgMi4xMzUtMi4xMTVtOC44NDctNy4wNzdhMi40OCAyLjQ4IDAgMCAxIDEuMDU3IDEuODkybC45NTYgNDUuNzM2LS44NzUgMTYuNTU0LS4xMDEgMS44MWMtLjAyLjYzLS4yODUgMS4yLS42OTIgMS42MDctLjQyNy40MDYtLjk3Ni42Ny0xLjYwNi42Ny0uNzEyIDAtMS4zMjItLjMyNS0xLjc1LS44MzNhMi4zIDIyLjMgMCAwIDEtLjUyOC0xLjM2MnYtLjA4MmwtLjg1NC0xOC4zODQuODU0LTQ1LjI5di0uNDI2YTIuMzQgMi4zNCAwIDAgMSAxLjA1OC0xLjkxMiAyLjI3IDIuMjcgMCAwIDEgMS4yMi0uMzY2Yy40NjggMCAuODk1LjE0MiAxLjI2LjM4Nm03LjU2Ni00LjMzMWMuNjkxLjQyNyAxLjE4IDEuMiAxLjIgMi4wNTRsMS4wNzcgNDkuOTA1LTEuMDc3IDE4LjF2LS4wMmMtLjAyIDEuMzQyLTEuMTE5IDIuNDQtMi40NCAyLjQ0LTEuMzIzIDAtMi40Mi0xLjA5OC0yLjQ0MS0yLjQybC0uNDg4LTguOTI4LS41MDktOS4xNzIuOTk3LTQ5LjY0MXYtLjI0NGMwLS43NTIuMzY2LTEuNDI0Ljg5NS0xLjg3MWEyLjQzIDIuNDMgMCAwIDEgMi43ODYtLjIwM202Ny4wNDkgMjguMzY5YzEyLjI0MyAwIDIyLjE2NyA5LjkwNCAyMi4xNjcgMjIuMTI2IDAgMTIuMjQzLTkuOTI0IDIyLjA0NS0yMi4xNDcgMjIuMDQ1SDk2LjU1OGMtMS4zMjItLjEyMi0yLjM4LTEuMTgtMi40LTIuNTQyVjUuMjQ3Yy4wMi0xLjI4MS40NjgtMS45NTIgMi4xMzUtMi42MDNBMzkuNiAzOS42IDAgMCAxIDExMC40NjggMGMyMC4zOTcgMCAzNy4xMzQgMTUuNjYgMzguOTAzIDM1LjYxYTIyLjIgMjIuMiAwIDAgMSA4LjU2Mi0xLjcwOSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";
  const Cast = Scratch.Cast;
  const vm = Scratch.vm;

  /*
    We must use a proxy since the SoundCloud API does not work outside SoundCloud origins.

    To prevent server stress, we will cache fetch results.
    I love this proxy and it has always been reliable and exceptional.
  */
  const proxy = "https://api.codetabs.com/v1/proxy?quest="

  const SoundCloudAPI = "https://api-v2.soundcloud.com/";
  const baseSoundCloudUrl = "https://soundcloud.com/";

  const cloudCache_ = new Map();

  const setCache = (id, value) => {
    // cache expires in 3 minutes
    cloudCache_.set(id, {
      expires: Date.now() + (180 * 1000),
      value: value
    });
  };

  const getCache = (id) => {
    if (cloudCache_.has(id)) {
      const item = cloudCache_.get(id);
      if (Date.now() > item.expires) {
        cloudCache_.delete(id);
      }

      return item.value;
    }

    return null;
  };

  const genMenuItem = (text, value, opt_pathValue) => {
    const item = {
      text: Scratch.translate(text),
      value: value ?? text
    };
    if (opt_pathValue) item.path = opt_pathValue;

    return item;
  };

  let clientID = "gxPRNsEq7CDD7Wvem4iymWOq3YfU7KS8"; // Updated client ID

  const TRACK_ATTRIBUTES = [
    genMenuItem("name", null, "title"),
    genMenuItem("artist", null, ["user", "username"]),
    genMenuItem("artist ID", null, "user_id"),
    genMenuItem("description", null, "description"),
    genMenuItem("cover", null, "artwork_url"),
    genMenuItem("release date", null, "created_at"),
    genMenuItem("formatted duration", null, "duration"),
    genMenuItem("duration", null, "duration"),
    genMenuItem("downloadable", null, "downloadable"),
    genMenuItem("plays", null, "playback_count"),
    genMenuItem("likes", null, "likes_count"),
    genMenuItem("comment count", null, "comment_count"),
    genMenuItem("genre", null, "genre"),
    genMenuItem("url", null, "permalink_url")
  ];
  const ARTIST_ATTRIBUTES = [
    genMenuItem("username", null, "username"),
    genMenuItem("description", null, "description"),
    genMenuItem("profile picture", null, "avatar_url"),
    genMenuItem("join date", null, "created_at"),
    genMenuItem("track count", null, "track_count"),
    genMenuItem("follower count", null, "followers_count"),
    genMenuItem("following count", null, "followings_count"),
    genMenuItem("url", null, "permalink_url")
  ];

  /*
    We try to cache artist information on track fetches, however,
    the data fetched does not contain all relevant artist information.
  */
  const STRONG_ARTIST_ATTS = [
    "description", "created_at",
    "followings_count", "track_count"
  ];

  vm.runtime.on("PROJECT_START", () => {
    cloudCache_.clear();
  });

  const color1 = "#ff2200";

  class SPsoundCloud {
    getInfo() {
      return {
        id: "SPsoundCloud",
        name: "SoundCloud API",
        color1,
        color2: "#db1b00",
        color3: "#c02300",
        menuIconURI,
        blockIconURI,
        blocks: [
          {
            opcode: "fetchFreshClient",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("fetch fresh client ID from SoundCloud")
          },
          {
            opcode: "isClientIDReady",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("client ID ready?")
          },
          {
            opcode: "setClient",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("set client ID to [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: clientID }
            }
          },
          {
            opcode: "getClientID",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("client ID")
          },
          {
            blockType: Scratch.BlockType.LABEL,
            text: Scratch.translate("Client ID must work for functionality")
          },
          {
            opcode: "testClient",
            blockType: Scratch.BlockType.BOOLEAN,
            disableMonitor: true,
            text: Scratch.translate("test client ID")
          },
          "---",
          {
            opcode: "extractID",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("ID of [THING] from url [URL]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "IDS" },
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "https://soundcloud.com/"
              }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Tracks") },
          {
            opcode: "getTrackAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from track ID [ID]"),
            arguments: {
              THING: {
                type: Scratch.ArgumentType.STRING,
                menu: "TRACKS"
              },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 }
            }
          },
          {
            opcode: "getTrackMp3",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get mp3 of track ID [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 }
            }
          },
          {
            opcode: "getTrackComment",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of [TYPE] comments from track ID [ID]"),
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "COMMENT" },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 241049935 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            },
          },
          {
            opcode: "searchTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("search for [NUM] tracks using query [QUERY]"),
            arguments: {
              NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "Ancient Visions" }
            }
          },
          {
            opcode: "getTrendingSongs",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM] trending songs"),
            arguments: {
              NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: Scratch.translate("Artists") },
          {
            opcode: "getArtistAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from artist ID [ID]"),
            arguments: {
              THING: {
                type: Scratch.ArgumentType.STRING,
                menu: "ARTISTS"
              },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 }
            }
          },
          {
            opcode: "getArtistFollowers",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of followers from artist ID [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "getArtistTracks",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [NUM2] offset [NUM1] of tracks from artist ID [ID]"),
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 127123168 },
              NUM1: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              NUM2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 }
            }
          },
          {
            opcode: "searchArtists",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("search for [NUM] artists using query [QUERY]"),
            arguments: {
              NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 10 },
              QUERY: { type: Scratch.ArgumentType.STRING, defaultValue: "Aliantos" }
            }
          },
          "---",
          {
            opcode: "getBulkTrackAtt",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get [THING] from track IDs [IDS]"),
            arguments: {
              THING: { type: Scratch.ArgumentType.STRING, menu: "TRACKS" },
              IDS: { type: Scratch.ArgumentType.STRING, defaultValue: "[]" }
            }
          },
          {
            opcode: "getTrackMetadataList",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("get metadata list from track IDs [IDS]"),
            arguments: {
              IDS: { type: Scratch.ArgumentType.STRING, defaultValue: "[]" }
            }
          }
        ],
        menus: {
          IDS: {
            acceptReporters: true,
            items: [
              genMenuItem("track", null, "track"),
              genMenuItem("artist", null, "artist")
            ]
          },
          TRACKS: {
            acceptReporters: true,
            items: TRACK_ATTRIBUTES
          },
          COMMENT: {
            acceptReporters: true,
            items: [
              genMenuItem("new"),
              genMenuItem("popular")
            ]
          },
          ARTISTS: {
            acceptReporters: true,
            items: ARTIST_ATTRIBUTES
          }
        }
      };
    }

    async fetchFreshClient() {
      try {
        const response = await fetch(proxy + encodeURIComponent(baseSoundCloudUrl));
        const html = await response.text();
        const jsFileMatch = html.match(/https:\/\/a-v2\.sndcdn\.com\/assets\/[^\"]*\.js/);
        if (jsFileMatch) {
          const jsFileUrl = jsFileMatch[0];
          const jsResponse = await fetch(proxy + encodeURIComponent(jsFileUrl));
          const jsContent = await jsResponse.text();
          const clientIDMatch = jsContent.match(/client_id:"([a-zA-Z0-9]*)"/);
          if (clientIDMatch && clientIDMatch[1]) {
            clientID = clientIDMatch[1];
            console.log("Successfully fetched new client ID:", clientID);
          } else {
            console.warn("Could not find client ID in JavaScript file.");
          }
        } else {
          console.warn("Could not find JavaScript file containing client ID on SoundCloud page.");
        }
      } catch (error) {
        console.error("Error fetching fresh client ID:", error);
      }
    }

    isClientIDReady() {
      return clientID && clientID.length > 0;
    }

    setClient(args) {
      clientID = args.ID;
    }

    getClientID() {
      return clientID;
    }

    async testClient() {
      try {
        const url = `${SoundCloudAPI}charts?kind=trending&genre=soundcloud%3Agenres%3Aall-music&client_id=${clientID}&limit=1`;
        const req = await fetch(proxy + encodeURIComponent(url));
        const json = await req.json();
        return json && json.collection && json.collection.length > 0;
      } catch (err) {
        console.error("Error testing client ID:", err);
        return false;
      }
    }

    async extractID(args) {
      const url = Cast.toString(args.URL);
      const thing = Cast.toString(args.THING);
      const resolveUrl = `${SoundCloudAPI}resolve?url=${encodeURIComponent(url)}&client_id=${clientID}`;
      const req = await fetch(proxy + encodeURIComponent(resolveUrl));
      const json = await req.json();

      if (thing === "track") {
        return json.id;
      } else if (thing === "artist") {
        return json.id;
      }
      return "";
    }

    async getTrackAtt(args) {
      const id = Cast.toNumber(args.ID);
      const thing = Cast.toString(args.THING);
      const cacheId = `track-${id}`;
      let track = getCache(cacheId);

      if (!track) {
        const url = `${SoundCloudAPI}tracks/${id}?client_id=${clientID}`;
        const req = await fetch(proxy + encodeURIComponent(url));
        track = await req.json();
        setCache(cacheId, track);
      }

      if (!track) return "";

      if (thing === "formatted duration") {
        const duration = track.duration;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
      }

      const attribute = TRACK_ATTRIBUTES.find(item => item.text === thing);
      if (attribute && attribute.path) {
        if (Array.isArray(attribute.path)) {
          let value = track;
          for (const p of attribute.path) {
            value = value[p];
            if (value === undefined) return "";
          }
          return value;
        } else {
          return track[attribute.path];
        }
      }
      return "";
    }

    async getTrackMp3(args) {
      const id = Cast.toNumber(args.ID);
      try {
        // First, get track metadata to find the media transcodings
        const trackUrl = `${SoundCloudAPI}tracks/${id}?client_id=${clientID}`;
        const trackReq = await fetch(proxy + encodeURIComponent(trackUrl));
        if (!trackReq.ok) return "";
        const trackJson = await trackReq.json();
        
        if (trackJson && trackJson.media && trackJson.media.transcodings) {
          // Look for a progressive mp3 stream first as it's easiest to play in Scratch/PenguinMod
          let transcoding = trackJson.media.transcodings.find(t => t.format.protocol === "progressive" && t.format.mime_type === "audio/mpeg");
          
          // Fallback to any progressive stream
          if (!transcoding) {
            transcoding = trackJson.media.transcodings.find(t => t.format.protocol === "progressive");
          }
          
          // Fallback to HLS if no progressive is found
          if (!transcoding) {
            transcoding = trackJson.media.transcodings[0];
          }

          if (transcoding && transcoding.url) {
            const streamUrl = `${transcoding.url}?client_id=${clientID}`;
            const streamReq = await fetch(proxy + encodeURIComponent(streamUrl));
            if (!streamReq.ok) return "";
            const streamJson = await streamReq.json();
            return streamJson.url || "";
          }
        }
      } catch (err) {
        console.error("Error getting track MP3:", err);
      }
      return "";
    }

    async getTrackComment(args) {
      const id = Cast.toNumber(args.ID);
      const type = Cast.toString(args.TYPE);
      const offset = Cast.toNumber(args.NUM1);
      const limit = Cast.toNumber(args.NUM2);

      let url = `${SoundCloudAPI}tracks/${id}/comments?client_id=${clientID}&limit=${limit}&offset=${offset}`;
      if (type === "popular") {
        url += "&sort=popular";
      }

      const req = await fetch(proxy + encodeURIComponent(url));
      const json = await req.json();
      if (json && json.collection) {
        return JSON.stringify(json.collection.map(item => item.id));
      }
      return "[]";
    }

    async searchTracks(args) {
      const query = Cast.toString(args.QUERY);
      const limit = Cast.toNumber(args.NUM);
      const url = `${SoundCloudAPI}search/tracks?q=${encodeURIComponent(query)}&client_id=${clientID}&limit=${limit}`;
      const req = await fetch(proxy + encodeURIComponent(url));
      const json = await req.json();
      if (json && json.collection) {
        // Cache all found tracks for instant attribute retrieval
        json.collection.forEach(track => {
          setCache(`track-${track.id}`, track);
        });
        return JSON.stringify(json.collection.map(item => item.id));
      }
      return "[]";
    }

    async getTrendingSongs(args) {
      const limit = Cast.toNumber(args.NUM);
      const url = `${SoundCloudAPI}charts?kind=trending&genre=soundcloud%3Agenres%3Aall-music&client_id=${clientID}&limit=${limit}`;
      const req = await fetch(proxy + encodeURIComponent(url));
      const json = await req.json();
      if (json && json.collection) {
        // Cache all found tracks for instant attribute retrieval
        json.collection.forEach(item => {
          if (item.track) setCache(`track-${item.track.id}`, item.track);
        });
        return JSON.stringify(json.collection.map(item => item.track.id));
      }
      return "[]";
    }

    async getArtistAtt(args) {
      const id = Cast.toNumber(args.ID);
      const thing = Cast.toString(args.THING);
      const cacheId = `artist-${id}`;
      let artist = getCache(cacheId);

      if (!artist) {
        const url = `${SoundCloudAPI}users/${id}?client_id=${clientID}`;
        const req = await fetch(proxy + encodeURIComponent(url));
        artist = await req.json();
        setCache(cacheId, artist);
      }

      if (!artist) return "";

      const attribute = ARTIST_ATTRIBUTES.find(item => item.text === thing);
      if (attribute && attribute.path) {
        return artist[attribute.path];
      }
      return "";
    }

    async getArtistFollowers(args) {
      const id = Cast.toNumber(args.ID);
      const offset = Cast.toNumber(args.NUM1);
      const limit = Cast.toNumber(args.NUM2);
      const url = `${SoundCloudAPI}users/${id}/followers?client_id=${clientID}&limit=${limit}&offset=${offset}`;
      const req = await fetch(proxy + encodeURIComponent(url));
      const json = await req.json();
      if (json && json.collection) {
        return JSON.stringify(json.collection.map(item => item.id));
      }
      return "[]";
    }

    async getArtistTracks(args) {
      const id = Cast.toNumber(args.ID);
      const offset = Cast.toNumber(args.NUM1);
      const limit = Cast.toNumber(args.NUM2);
      const url = `${SoundCloudAPI}users/${id}/tracks?client_id=${clientID}&limit=${limit}&offset=${offset}`;
      const req = await fetch(proxy + encodeURIComponent(url));
      const json = await req.json();
      if (json && json.collection) {
        return JSON.stringify(json.collection.map(item => item.id));
      }
      return "[]";
    }

    async searchArtists(args) {
      const query = Cast.toString(args.QUERY);
      const limit = Cast.toNumber(args.NUM);
      const url = `${SoundCloudAPI}search/users?q=${encodeURIComponent(query)}&client_id=${clientID}&limit=${limit}`;
      const req = await fetch(proxy + encodeURIComponent(url));
      const json = await req.json();
      if (json && json.collection) {
        // Cache all found artists
        json.collection.forEach(artist => {
          setCache(`artist-${artist.id}`, artist);
        });
        return JSON.stringify(json.collection.map(item => item.id));
      }
      return "[]";
    }

    async getBulkTrackAtt(args) {
      const ids = JSON.parse(Cast.toString(args.IDS) || "[]");
      const thing = Cast.toString(args.THING);
      const results = [];
      
      for (const id of ids) {
        results.push(await this.getTrackAtt({ ID: id, THING: thing }));
      }
      
      return JSON.stringify(results);
    }

    async getTrackMetadataList(args) {
      const ids = JSON.parse(Cast.toString(args.IDS) || "[]");
      const results = [];
      
      for (const id of ids) {
        const name = await this.getTrackAtt({ ID: id, THING: "name" });
        const cover = await this.getTrackAtt({ ID: id, THING: "cover" });
        const description = await this.getTrackAtt({ ID: id, THING: "description" });
        const artist = await this.getTrackAtt({ ID: id, THING: "artist" });
        
        results.push({
          id: id,
          name: name,
          cover: cover,
          description: description,
          artist: artist
        });
      }
      
      return JSON.stringify(results);
    }
  }

  if (Scratch.gui) Scratch.gui.getBlockly().then((SB) => {
    function add2Body() {
      const grad = document.querySelector(`div[class="SPgradCache"]`) || document.createElement("div");
      grad.setAttribute("class", "SPgradCache");
      grad.innerHTML = `
        ${grad.innerHTML}
        <svg><defs>
          <linearGradient x1="240" y1="0" x2="240" y2="100" gradientUnits="userSpaceOnUse" id="SPsoundCloud-GRAD">
          <stop offset="0" stop-color="#ff7600"/><stop offset="0.5" stop-color="#ff2200"/></linearGradient>
        </defs></svg>`;
      document.body.append(grad);
    }
    add2Body();
    if (!SB?.SPgradients?.patched) {
      /* Gradient Patch by SharkPool, inspired by 0znzw */
      SB.SPgradients = { gradientUrls: new Map(), patched: true };
      const ogBlockRender = SB.BlockSvg.prototype.render;
      SB.BlockSvg.prototype.render = function(...args) {
        const result = ogBlockRender.apply(this, args);
        const grad = SB.SPgradients.gradientUrls.get(this.type.slice(0, this.type.indexOf("_")));
        if (grad && this?.svgPath_ && this?.category_) {
          const svg = this.svgPath_;
          const fill = svg.getAttribute("fill");
          this.svgPath_.setAttribute(
            fill === grad.check || fill === grad.path ? "fill" : "stroke",
            grad.path
          );
        }
        return result;
      }
    }
    SB.SPgradients.gradientUrls.set("SPsoundCloud", { path: "url(#SPsoundCloud-GRAD)", check: color1 });
  });

  Scratch.extensions.register(new SPsoundCloud());
})(Scratch);
