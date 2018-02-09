<?php

namespace VideInfra\CMSBundle\Page\Block;

use VideInfra\CMSBundle\Entity\Block;

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
    public function getOptions();

    /**
     * @param Block $block
     * @return mixed
     */
    public function getContent(Block $block);
}