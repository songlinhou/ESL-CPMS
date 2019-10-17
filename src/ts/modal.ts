export function showYesNoModal(modalTitle:string,htmlContent:string,yes:Function,no:Function,major:boolean=true,yesLabel="Yes",noLabel="No"){
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
    if(major){
        $('#modalYES').addClass('btn-primary');
        $('#modalNO').addClass('btn-secondary');
    }
    else{
        $('#modalYES').addClass('btn-secondary');
        $('#modalNO').addClass('btn-primary');
    }

    $('#modalYES').html(yesLabel);
    $('#modalNO').html(noLabel);
    
    
    $('#modalYES').on('click',(event)=>{
        event.preventDefault();
        setTimeout(()=>{
            yes();
            $('#yesNoModal').modal('hide');
        },200)
        
    });
    $('#modalNO').on('click',(event)=>{
        event.preventDefault();
        setTimeout(()=>{
            no();
        },200);
        
    });
    $('#yesNoModal').modal('show');
}