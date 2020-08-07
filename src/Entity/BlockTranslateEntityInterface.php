<?php

namespace Octave\CMSBundle\Entity;

interface BlockTranslateEntityInterface
{
    public function getTitle();

    public function getContent();

    public function getLocale();
}