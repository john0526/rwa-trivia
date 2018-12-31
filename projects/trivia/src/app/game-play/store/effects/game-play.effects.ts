import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { switchMap, map, filter, mergeMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { GameService } from './../../../../../../shared-library/src/lib/core/services';
import { Game, Question, RouterStateUrl } from 'shared-library/shared/model';
import { GamePlayActionTypes } from '../actions';
import * as gameplayactions from '../actions/game-play.actions';
import { GameActions } from '../../../../../../shared-library/src/lib/core/store/actions/game.actions';
import { GamePlayState } from '../reducers';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';

@Injectable()
export class GamePlayEffects {


  @Effect()
  startNewGame$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.CREATE_NEW))
    .pipe(
      switchMap((action: gameplayactions.CreateNewGame) =>
        this.svc.createNewGame(action.payload.gameOptions, action.payload.user).pipe(
          map((gameId: string) => this.gameActions.createNewGameSuccess(gameId))
          // catchError(error => new)
        )
      )
    );


  @Effect()
  // handle location update
  loadGame$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.LOAD_GAME))
    .pipe(
      switchMap((action: gameplayactions.LoadGame) =>
        this.svc.getGame(action.payload).pipe(
          map((game: Game) => new gameplayactions.LoadGameSuccess(game))
        )
      )
    );

  // load from router
  @Effect()
  // handle location update
  loadGame2$ = this.actions$
    .pipe(ofType(ROUTER_NAVIGATION))
    .pipe(
      map((action: any): RouterStateUrl => action.payload.routerState),
      filter((routerState: RouterStateUrl) => {
        if (routerState.url.toLowerCase().startsWith('/game-play/') &&
          routerState.params) {
          return true;
        } else if (routerState.url.toLowerCase().startsWith('/game-play/') && routerState['root']) {
          return true;
        } else {
          return false;
        }
      }
      ))
    .pipe(
      switchMap((routerState: RouterStateUrl) => {
        let gameid = '';
        if (routerState.params) {
          gameid = routerState.params.gameid;
        } else if (routerState['root'].firstChild.firstChild.params.gameid) {
          gameid = routerState['root'].firstChild.firstChild.params.gameid;
        }
        this.store.dispatch(new gameplayactions.ResetCurrentGame());
        return this.svc.getGame(gameid).pipe(
          map((game: Game) => new gameplayactions.LoadGameSuccess(game))
        );
      }
      ));

  @Effect()
  loadNextQuestion$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.GET_NEXT_QUESTION))
    .pipe(
      switchMap((action: gameplayactions.GetNextQuestion) =>
        this.svc.getNextQuestion(action.payload).pipe(
          map((question: Question) => new gameplayactions.GetNextQuestionSuccess(question))
        )
      )
    );

  @Effect()
  addPlayerQnA$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.ADD_PLAYER_QNA))
    .pipe(
      switchMap((action: gameplayactions.AddPlayerQnA) =>
        this.svc.addPlayerQnAToGame(action.payload.gameId, action.payload.playerQnA).pipe(
          map((msg: any) => new gameplayactions.UpdateGameSuccess())
        )
      ));

  @Effect()
  setGameOver$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.SET_GAME_OVER))
    .pipe(
      switchMap((action: gameplayactions.SetGameOver) =>
        this.svc.setGameOver(action.payload).pipe(
          map((msg: any) => new gameplayactions.UpdateGameSuccess())
        )
      ));

  @Effect()
  getUserAnsweredQuestions$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.GET_USERS_ANSWERED_QUESTION))
    .pipe(
      switchMap((action: gameplayactions.GetUsersAnsweredQuestion) =>
        this.svc.getUsersAnsweredQuestion(action.payload.userId, action.payload.game).pipe(
          map((questionArray: any) => new gameplayactions.GetUsersAnsweredQuestionSuccess(questionArray))
        )
      ));
  @Effect()
  reportQuestion$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.SAVE_REPORT_QUESTION))
    .pipe(
      switchMap((action: gameplayactions.SaveReportQuestion) =>
        this.svc.saveReportQuestion(action.payload.reportQuestion, action.payload.game)
          .pipe(mergeMap((status: any) => this.svc.updateGame(action.payload.reportQuestion, action.payload.game)))
          .pipe(map((report: any) => new gameplayactions.SaveReportQuestionSuccess())))
    );

  @Effect()
  UpdateGameRound$ = this.actions$
    .pipe(ofType(GamePlayActionTypes.UPDATE_GAME_ROUND))
    .pipe(
      switchMap((action: gameplayactions.UpdateGameRound) =>
        this.svc.updateGameRound(action.payload).pipe(
          map((msg: any) => new gameplayactions.UpdateGameSuccess())
        )
      ));

  constructor(
    private actions$: Actions,
    public store: Store<GamePlayState>,
    public gameActions: GameActions,
    private svc: GameService,
  ) { }

}
