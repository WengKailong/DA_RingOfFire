import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { EditPlayerComponent } from '../edit-player/edit-player.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  
  game: any;
  gameId: string = '';
  gameOver: boolean = false;

  constructor(
    private router: ActivatedRoute,
    private firestore: AngularFirestore,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.newGame();
    this.router.params.subscribe((params) => {
      this.gameId = params.id;
      console.log(this.gameId);
      this.firestore
        .collection('games')
        .doc(params.id)
        .valueChanges()
        .subscribe((gameParam: any) => {
          console.log('Game update:', gameParam);
          this.game.players = gameParam.players;
          this.game.playerProfiles = gameParam.playerProfiles;
          this.game.stack = gameParam.stack;
          this.game.playedCards = gameParam.playedCards;
          this.game.currentPlayer = gameParam.currentPlayer;
          this.game.pickCardAnimation = gameParam.pickCardAnimation;
          this.game.currentCard = gameParam.currentCard
        });
    });
  }

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if(this.game.stack.length < 52){
      this.gameOver = true;
    }

    if (!this.game.pickCardAnimation) {
      this.game.currentCard = this.game.stack[this.game.stack.length - 1];
      console.log(this.game.currentCard);
      this.game.stack.pop();

      console.log(this.game.playedCards);
      this.game.pickCardAnimation = true;

      this.game.currentPlayer++;
      this.game.currentPlayer =
        this.game.currentPlayer % this.game.players.length;

      this.saveGame();
      setTimeout(() => {
        this.game.pickCardAnimation = false;
        this.game.playedCards.push(this.game.currentCard);
        this.saveGame();
      }, 1200);
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.game.playerProfiles.push('Profile.png');
        this.saveGame();
      }
    });
  }

  saveGame() {
    console.log(this.game.toJson());

    this.firestore
      .collection('games')
      .doc(this.gameId)
      .update(this.game.toJson());
  }

  editPlayer(playerId : number){
    console.log('Edit Player', playerId);

    const dialogRef = this.dialog.open(EditPlayerComponent, {
    });

    dialogRef.afterClosed().subscribe((change: string) => {
      console.log('received change', change);
      if(change){
        if(change == 'DELETE'){
          this.game.players.splice(playerId,1);
          this.game.playerProfiles.splice(playerId,1);
        }else{
          this.game.playerProfiles[playerId] = change;
        }
        
        this.saveGame();
      }
      
    });
    
  }
}
