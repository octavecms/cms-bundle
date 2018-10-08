<?php

namespace Octave\CMSBundle\Page\Block;

use Octave\CMSBundle\Entity\BlockTrait;

interface BlockInterface
{
    /**
     * @return string
     */
    public function getName();

    /**
     * @return string
     */
    public function getLabel();

    /**
     * @return string
     */
    public function getIcon();

    /**
     * @return string
     */
    public function getFormType();

    /**
     * @return string
     */
    public function getContentTemplate();

    /**
     * @return array
     */
    public function getTemplateParameters();

    /**
     * @return array
     */
    public function getOptions();

    /**
     * @param BlockTrait $block
     * @return mixed
     */
    public function getContent(BlockTrait $block);
}