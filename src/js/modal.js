"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function showYesNoModal(modalTitle, htmlContent, yes, no, major, yesLabel, noLabel) {
    if (major === void 0) { major = true; }
    if (yesLabel === void 0) { yesLabel = "Yes"; }
    if (noLabel === void 0) { noLabel = "No"; }
    $('#yesNoLabel').html(modalTitle);
    $('#yesNo-modal-content').html(htmlContent);
    $('#modalYES').off('click');
    $('#modalNO').off('click');
    $('#modalYES').removeClass('btn-primary');
    $('#modalYES').removeClass('btn-secondary');
    $('#modalNO').removeClass('btn-primary');
    $('#modalNO').removeClass('btn-secondary');
    // btn-primary
    // btn-secondary
    if (major) {
        $('#modalYES').addClass('btn-primary');
        $('#modalNO').addClass('btn-secondary');
    }
    else {
        $('#modalYES').addClass('btn-secondary');
        $('#modalNO').addClass('btn-primary');
    }
    $('#modalYES').html(yesLabel);
    $('#modalNO').html(noLabel);
    $('#modalYES').on('click', function (event) {
        event.preventDefault();
        setTimeout(function () {
            yes();
            $('#yesNoModal').modal('hide');
        }, 200);
    });
    $('#modalNO').on('click', function (event) {
        event.preventDefault();
        setTimeout(function () {
            no();
        }, 200);
    });
    $('#yesNoModal').modal('show');
}
exports.showYesNoModal = showYesNoModal;
//# sourceMappingURL=modal.js.map