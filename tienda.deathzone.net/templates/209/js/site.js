$(document).ready(function() {

    var giftShowing = false;
    var giftButtonText = "Gift this package";

    $(document).on('click','.btn-gift', function(){
        giftButtonText = $(".btn-gift").text();
        if(!giftShowing) {
            $(".btn-gift").html(giftButtonText + ' <i class="fa fa-chevron-up" aria-hidden="true"></i>');
            $(".gift-fields").slideDown("fast", function () {
                giftShowing = true;
            });
        }else{
            $(".btn-gift").html(giftButtonText + ' <i class="fa fa-chevron-down" aria-hidden="true"></i>');
            $(".gift-fields").slideUp("fast", function () {
                giftShowing = false;
            });
        }
    });

    $('body').tooltip({
        selector: '[data-toggle="tooltip"]',
        container: '.modal-footer'
    });

    notification.clear();

    $(document.body).on('click', '.btn-copy', function(){
        $("input[name='copy-hash']").focus();
        $("input[name='copy-hash']").select();
        document.execCommand('copy');

        if (window.getSelection) {
            if (window.getSelection().empty) {  // Chrome
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) {  // Firefox
                window.getSelection().removeAllRanges();
            }
        } else if (document.selection) {  // IE
            document.selection.empty();
        }
        $(this).text('Copied');
    });

    $(".mc-skin").minecraftSkin({scale: 2});

    $(".toggle-tooltip").tooltip();

    $(".toggle-modal").on("click", function (e) {
        remote = $(this).data("remote");

        $.ajax({
            url: remote,
            success: function (data) {
                $('#popup-modal').html(data);
                $('#popup-modal').modal("show");
            },
            error: function (request, status, error) {
                alert(request.responseText);
            },
            async: true
        });

        e.preventDefault();
    });


    $(".gifting").on("click", "input[type=checkbox]", function () {
        name = $(this).attr('id');
        if ($(this).is(":checked")) {
            $("#ign_" + name).removeClass("hide").removeClass("hidden").attr("required", "required");
        } else {
            $("#ign_" + name).addClass("hide").addClass("hidden").removeAttr("required");
        }
    });

    $(".gifting").on("change", "input", function () {
        document.cookie = "buycraft_gifting=" + $(".gifting").find("input").serialize();
    });

    stored = unserialize(getCookie("buycraft_gifting"));

    for (i in stored) {
        field = jQuery(".gifting").find("[name='" + i + "']");
        if (field.attr("type") == "checkbox") {
            if (stored[i] == "1") {
                field.eq(0).checked = false;
                field.attr("checked", false);
                field.click();
            }
        } else {
            field.val(stored[i]);
        }

        field.change();
    }

    $(document.body).on("submit", ".checkout form.gateway", function () {
        form = $(this);
        button = $(form).find("button[type=submit]");

        button.button("loading");

        return processForm(form);
    });
});

function clearWaitingOverlay()
{
    $("div#waiting-overlay").fadeOut();
}

function processForm(form)
{
    $.ajax({
        type: 'POST',
        url: form.attr("action"),
        data: form.serialize() + "&" + $(".gifting").find("input").serialize(),
        dataType: "json",
        success: function(json)
        {
            if (json.type == "error" && json.success_url == "redirect")
            {
                window.top.location.replace("/checkout/basket");
            } else if (json.type == "error")
            {
                if (typeof reRenderWidgets != "undefined"  && json.success_url == "rerender"){
                    reRenderWidgets();
                }
                clearWaitingOverlay();

                notification.show("danger", json.message);
                button.button("reset");
            }
            else if (json.type == "success")
            {
                window.top.location.replace(json.data);
            }
        },
        error: function(data)
        {
            notification.show("danger", "We could not send you to Tebex Checkout - please refresh the page and try again.");
            button.button("reset");
        }
    });

    return false;

}


notification = new function()
{
	this.show = function(type, message)
	{
		clearTimeout(this.timeout);

		$(".notification").empty().append('<div class="alert alert-' + type + ' alert-dismissable"></div>');
		$(".notification .alert").append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>').append(message);

		$("html, body").animate({ scrollTop: $("body").offset().top }, "fast");

		this.clear();
	}

	this.clear = function()
	{
		this.timeout = window.setTimeout(function() 
		{
		    $(".alert").fadeTo(200, 0).slideUp(200, function()
		    {
		        $(this).remove(); 
		    });
		}, 5000);
	}
}


function unserialize(serializedString){
	var str = decodeURI(serializedString);
	var pairs = str.split('&');
	var obj = {}, p, idx;
	for (var i=0, n=pairs.length; i < n; i++) {
		p = pairs[i].split('=');
		idx = p[0];
		if (obj[idx] === undefined) {
			obj[idx] = unescape(p[1]).replace ( /\+/g, ' ' );
		}else{
			if (typeof obj[idx] == "string") {
				obj[idx]=[obj[idx]];
			}
			obj[idx].push(unescape(p[1]).replace ( /\+/g, ' ' ));
		}
	}
	return obj;
};


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

if (document.getElementById("copyWebstoreIp") !== null) {
    document.getElementById("copyWebstoreIp").addEventListener("click", function () {
        copyToClipboard(document.getElementById("webstoreIp"));
        document.getElementById("copyWebstoreIp").innerHTML="Copied <i class='fas fa-check'></i></i>";
    });
}

function copyToClipboard(elem) {
    // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
        succeed = document.execCommand("copy");
    } catch (e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}