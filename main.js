//const socket = io('http://localhost:3000');
const socket = io('https://streamrtc2020.herokuapp.com/');
$('#div-chat').hide();

let customConfig;

$.ajax({
	url: "https://service.xirsys.com/ice",
	data: {
		ident: "thanhvlogs167",
		secret: "e7c41532-f68d-11ea-bbcc-0242ac150003",
		domain: "https://duythanhdz2019.github.io/web-rtc/",
		application: "default",
		room: "default",
		secure: 1
	},
	success: function (data, status) {
		//data.d is where the iceServers object lives
		customConfig = data.d;
		console.log(customConfig);
	},
	async: false
});

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
	$('#div-chat').show();
	$('#div-dang-ky').hide();

	console.log(arrUserInfo);
	arrUserInfo.forEach(user => {
		const { ten, peerId } = user; 
		$('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
	});

	socket.on('CO_NGUOI_DUNG_MOI', user => {
		console.log(user);
		const { ten, peerId } = user;
		$('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
	});

	socket.on('AI_DO_NGAT_KET_NOI', peerId => {
		$(`#${peerId}`).remove();
	})
});

socket.on('DANG_KY_THAT_BAI', () => alert('Username da ton tai! Vui long chon username khac!'));

function openStream() {
	const config = {audio: false, video: true};
	return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream){
	const video = document.getElementById(idVideoTag);
	video.srcObject = stream;
	video.play();
}

//openStream()
//.then(stream => {
//	playStream('localStream', stream);
//});

const peer = new Peer({key: 'peerjs', debug: 2, host: 'webrtcserver2020.herokuapp.com', secure: true, port: 443});

peer.on('open', id => {
	$('#my-peer').append(id);
	$('#btnSignUp').click(() => {
		const username = $('#txtUsername').val();
		socket.emit('NGUOI_DUNG_DANG_KY', {	ten: username, peerId: id });
	}); 
});

//Caller
$('#btnCall').click(() => {
	const id = $('#remoteID').val();

	openStream()
	.then(stream => {
		playStream('localStream', stream);
		const call = peer.call(id, stream);
		call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
	});
});

//Receiver
peer.on('call', call => {
	openStream()
	.then(stream => {
		call.answer(stream);
		playStream('localStream', stream);
		call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
	});
});

$('#ulUser').on('click', 'li', function(){
	console.log($(this).attr('id'));
	const id = $(this).attr('id');
	openStream()
	.then(stream => {
		playStream('localStream', stream);
		const call = peer.call(id, stream);
		call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
	});
});