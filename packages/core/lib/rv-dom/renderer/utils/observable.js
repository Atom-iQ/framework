import 'rxjs';

function unsubscribe(withSub) {
    if (withSub.subscription) {
        withSub.subscription.unsubscribe();
    }
}

export { unsubscribe };
