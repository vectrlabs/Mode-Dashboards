Styles & Scripts for dashboards in Mode Analytics. Mode has an "edit HTML" tab for each dashboard, which we use heavily for our analytics dashboards, but it does not have a way to re-use any code _across_ dashboards, which we need.

So, we store out stuff here then include it in our dashboards with [RawGit](https://rawgit.com) rather than writing it inline in the "edit HTML" tab. That way we can re-use it.

****

In Mode, click "edit" HTML then add a link with this format:

`https://rawgit.com/vectrlabs/Mode-Dashboards/master/$filename.$ext`

As in add:

`<link rel='stylesheet' href='https://rawgit.com/vectrlabs/Mode-Dashboards/master/some-styles.css' />`

Or:

`<script type='text/javascript' src='https://rawgit.com/vectrlabs/Mode-Dashboards/master/some-styles.css' />`